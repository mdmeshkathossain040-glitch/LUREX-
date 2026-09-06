const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, transaction } = require('../config/db');
const config = require('../config/env');
const { success, error, AppError } = require('../utils/response');

function generateTokens(user) {
  const payload = {
    userId: user.id,
    role: user.role,
    phone: user.phone,
    email: user.email
  };
  const accessToken = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRET, { expiresIn: config.REFRESH_TOKEN_EXPIRES_IN });
  return { accessToken, refreshToken };
}

/**
 * Register buyer or seller
 */
async function register(req, res, next) {
  try {
    const { name, phone, email, password, role = 'buyer', shopName } = req.body;

    if (!name || !phone || !password) {
      return error(res, 'MISSING_FIELDS', 'Name, phone, and password are required', 400);
    }

    // Check existing
    const existing = await query('SELECT id FROM users WHERE phone = $1 OR (email IS NOT NULL AND email = $2)', [phone, email || null]);
    if (existing.rows.length > 0) {
      return error(res, 'USER_EXISTS', 'A user with this phone or email already exists', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await transaction(async (client) => {
      // 1. Insert user
      const userRes = await client.query(
        `INSERT INTO users (name, phone, email, password_hash, role, is_active, is_verified)
         VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)
         RETURNING id, name, phone, email, role, is_active, created_at`,
        [name, phone, email || null, passwordHash, role === 'seller' ? 'seller' : 'buyer']
      );
      const user = userRes.rows[0];

      // 2. Initialize Cart for user
      await client.query('INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);

      // 3. If seller, create Shop & Wallet
      let shop = null;
      if (role === 'seller') {
        const generatedSlug = (shopName || `${name} Store`).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
        const shopRes = await client.query(
          `INSERT INTO shops (seller_id, name, slug, description, status)
           VALUES ($1, $2, $3, $4, 'pending')
           RETURNING *`,
          [user.id, shopName || `${name}'s Shop`, generatedSlug, 'Welcome to my official shop on LUREX!']
        );
        shop = shopRes.rows[0];

        // Create shop settings
        await client.query('INSERT INTO shop_settings (shop_id) VALUES ($1)', [shop.id]);

        // Create seller wallet
        await client.query('INSERT INTO seller_balances (seller_id) VALUES ($1)', [user.id]);
      }

      return { user, shop };
    });

    const tokens = generateTokens(result.user);

    return success(res, {
      user: result.user,
      shop: result.shop,
      ...tokens
    }, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Login with email or phone + password
 */
async function login(req, res, next) {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return error(res, 'INVALID_CREDENTIALS', 'Login identifier (email/phone) and password required', 400);
    }

    const userRes = await query(
      `SELECT id, name, phone, email, password_hash, role, is_active, is_verified, avatar_url 
       FROM users 
       WHERE phone = $1 OR email = $1`,
      [login]
    );

    if (userRes.rows.length === 0) {
      return error(res, 'AUTH_FAILED', 'Invalid phone/email or password', 401);
    }

    const user = userRes.rows[0];
    if (!user.is_active) {
      return error(res, 'ACCOUNT_DEACTIVATED', 'Your account has been suspended by LUREX admin', 403);
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return error(res, 'AUTH_FAILED', 'Invalid phone/email or password', 401);
    }

    // Get shop if seller
    let shop = null;
    if (user.role === 'seller') {
      const sRes = await query('SELECT * FROM shops WHERE seller_id = $1', [user.id]);
      shop = sRes.rows[0] || null;
    }

    const tokens = generateTokens(user);

    delete user.password_hash;
    return success(res, {
      user,
      shop,
      ...tokens
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current authenticated user
 */
async function getMe(req, res, next) {
  try {
    const userRes = await query(
      'SELECT id, name, phone, email, role, is_active, is_verified, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (userRes.rows.length === 0) {
      return error(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    const user = userRes.rows[0];
    let shop = null;
    if (user.role === 'seller') {
      const sRes = await query('SELECT * FROM shops WHERE seller_id = $1', [user.id]);
      shop = sRes.rows[0] || null;
    }

    return success(res, { user, shop });
  } catch (err) {
    next(err);
  }
}

/**
 * Send OTP (SMS/Email)
 */
async function sendOtp(req, res, next) {
  try {
    const { contact, purpose = 'registration' } = req.body;
    if (!contact) {
      return error(res, 'MISSING_CONTACT', 'Phone number or email is required', 400);
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    await query(
      `INSERT INTO otp_verifications (contact, otp_code, purpose, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [contact, otpCode, purpose, expiresAt]
    );

    console.log(`[SMS OTP Dispatcher] Sent OTP ${otpCode} to ${contact} for ${purpose}`);

    return success(res, {
      message: 'OTP sent successfully to ' + contact,
      expiresInSeconds: 300,
      // For development/demo convenience:
      debugOtp: config.NODE_ENV === 'development' ? otpCode : undefined
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify OTP
 */
async function verifyOtp(req, res, next) {
  try {
    const { contact, otpCode, purpose = 'registration' } = req.body;
    const otpRes = await query(
      `SELECT * FROM otp_verifications 
       WHERE contact = $1 AND otp_code = $2 AND purpose = $3 AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [contact, otpCode, purpose]
    );

    if (otpRes.rows.length === 0) {
      return error(res, 'INVALID_OTP', 'Invalid or expired OTP code', 400);
    }

    await query('UPDATE otp_verifications SET is_used = TRUE WHERE id = $1', [otpRes.rows[0].id]);

    return success(res, { verified: true, message: 'OTP verified successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  sendOtp,
  verifyOtp
};
