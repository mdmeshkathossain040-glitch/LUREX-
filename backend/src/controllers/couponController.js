const { query } = require('../config/db');
const { success, error } = require('../utils/response');

async function validateCoupon(req, res, next) {
  try {
    const { code, amount } = req.body;
    const cRes = await query(
      `SELECT * FROM coupons 
       WHERE code = $1 AND is_active = TRUE AND valid_until > NOW()`,
      [code]
    );

    if (cRes.rows.length === 0) {
      return error(res, 'INVALID_COUPON', 'Coupon code is invalid or expired', 404);
    }

    const coupon = cRes.rows[0];
    const subtotal = parseFloat(amount || 0);

    if (subtotal < parseFloat(coupon.min_purchase_amount)) {
      return error(res, 'MINIMUM_NOT_MET', `Minimum purchase of BDT ${coupon.min_purchase_amount} required for this coupon`, 400);
    }

    let discount = 0;
    if (coupon.discount_type === 'fixed') {
      discount = Math.min(parseFloat(coupon.discount_value), subtotal);
    } else {
      discount = (subtotal * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, parseFloat(coupon.max_discount_amount));
      }
    }

    return success(res, {
      code: coupon.code,
      discount: parseFloat(discount.toFixed(2)),
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { validateCoupon };
