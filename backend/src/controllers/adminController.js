const { query, transaction } = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * Get comprehensive analytics dashboard metrics
 */
async function getAnalytics(req, res, next) {
  try {
    const statsSql = `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'buyer') AS total_buyers,
        (SELECT COUNT(*) FROM users WHERE role = 'seller') AS total_sellers,
        (SELECT COUNT(*) FROM shops WHERE status = 'approved') AS total_approved_shops,
        (SELECT COUNT(*) FROM shops WHERE status = 'pending') AS pending_shops,
        (SELECT COUNT(*) FROM products) AS total_products,
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COUNT(*) FROM orders WHERE payment_status = 'paid') AS total_paid_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid') AS gross_merchandise_volume,
        (SELECT COALESCE(SUM(commission_amount), 0) FROM commissions) AS total_marketplace_commission,
        (SELECT COUNT(*) FROM withdrawal_requests WHERE status = 'pending') AS pending_withdrawals,
        (SELECT COALESCE(SUM(amount), 0) FROM withdrawal_requests WHERE status = 'paid') AS total_paid_withdrawals
    `;

    const statsRes = await query(statsSql);
    return success(res, statsRes.rows[0]);
  } catch (err) {
    next(err);
  }
}

/**
 * List users with pagination and role filter
 */
async function listUsers(req, res, next) {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereClause = '';

    if (role) {
      params.push(role);
      whereClause = 'WHERE role = $1';
    }

    const sql = `
      SELECT id, name, email, phone, role, is_active, is_verified, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(parseInt(limit), offset);

    const usersRes = await query(sql, params);
    return success(res, usersRes.rows);
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle user active status
 */
async function toggleUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const updated = await query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, is_active',
      [is_active, id]
    );
    return success(res, updated.rows[0]);
  } catch (err) {
    next(err);
  }
}

/**
 * List shops for admin review
 */
async function listShops(req, res, next) {
  try {
    const { status } = req.query;
    const params = [];
    let where = '';
    if (status) {
      params.push(status);
      where = 'WHERE s.status = $1';
    }

    const sql = `
      SELECT s.*, u.name AS seller_name, u.phone AS seller_phone, u.email AS seller_email
      FROM shops s
      JOIN users u ON s.seller_id = u.id
      ${where}
      ORDER BY s.created_at DESC
    `;

    const shopsRes = await query(sql, params);
    return success(res, shopsRes.rows);
  } catch (err) {
    next(err);
  }
}

/**
 * Approve or Reject shop
 */
async function updateShopStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved', 'rejected', 'suspended'

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return error(res, 'INVALID_STATUS', 'Status must be approved, rejected, or suspended', 400);
    }

    const updated = await query(
      'UPDATE shops SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    return success(res, updated.rows[0]);
  } catch (err) {
    next(err);
  }
}

/**
 * List withdrawals
 */
async function listWithdrawals(req, res, next) {
  try {
    const { status } = req.query;
    const params = [];
    let where = '';
    if (status) {
      params.push(status);
      where = 'WHERE w.status = $1';
    }

    const sql = `
      SELECT 
        w.*,
        u.name AS seller_name,
        u.phone AS seller_phone,
        pa.account_type,
        pa.account_number,
        pa.bank_name,
        pa.branch_name,
        pa.routing_number
      FROM withdrawal_requests w
      JOIN users u ON w.seller_id = u.id
      JOIN seller_payout_accounts pa ON w.payout_account_id = pa.id
      ${where}
      ORDER BY w.requested_at DESC
    `;

    const wRes = await query(sql, params);
    return success(res, wRes.rows);
  } catch (err) {
    next(err);
  }
}

/**
 * Process withdrawal (mark paid or reject)
 */
async function processWithdrawal(req, res, next) {
  try {
    const { id } = req.params;
    const { status, transaction_ref, admin_note } = req.body; // 'paid' or 'rejected'

    const wRes = await query('SELECT * FROM withdrawal_requests WHERE id = $1', [id]);
    if (wRes.rows.length === 0) {
      return error(res, 'NOT_FOUND', 'Withdrawal request not found', 404);
    }
    const withdrawal = wRes.rows[0];

    await transaction(async (client) => {
      await client.query(
        `UPDATE withdrawal_requests 
         SET status = $1, transaction_ref = $2, admin_note = $3, processed_at = NOW() 
         WHERE id = $4`,
        [status, transaction_ref || null, admin_note || null, id]
      );

      // If paid, update total_withdrawn
      if (status === 'paid') {
        await client.query(
          `UPDATE seller_balances 
           SET total_withdrawn = total_withdrawn + $1, updated_at = NOW() 
           WHERE seller_id = $2`,
          [withdrawal.amount, withdrawal.seller_id]
        );
      } else if (status === 'rejected') {
        // Refund back to seller balance
        await client.query(
          `UPDATE seller_balances 
           SET current_balance = current_balance + $1, updated_at = NOW() 
           WHERE seller_id = $2`,
          [withdrawal.amount, withdrawal.seller_id]
        );
      }
    });

    return success(res, { message: `Withdrawal request updated to ${status}` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAnalytics,
  listUsers,
  toggleUserStatus,
  listShops,
  updateShopStatus,
  listWithdrawals,
  processWithdrawal
};
