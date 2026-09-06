const { query, transaction } = require('../config/db');
const { success, error, AppError } = require('../utils/response');

/**
 * Get seller dashboard overview
 */
async function getSellerDashboard(req, res, next) {
  try {
    const sRes = await query('SELECT * FROM shops WHERE seller_id = $1', [req.user.id]);
    if (sRes.rows.length === 0) {
      return error(res, 'SHOP_NOT_FOUND', 'No shop registered for this seller account', 404);
    }
    const shop = sRes.rows[0];

    // Balance
    let bRes = await query('SELECT * FROM seller_balances WHERE seller_id = $1', [req.user.id]);
    if (bRes.rows.length === 0) {
      bRes = await query(
        'INSERT INTO seller_balances (seller_id) VALUES ($1) RETURNING *',
        [req.user.id]
      );
    }
    const balance = bRes.rows[0];

    // Stats
    const statsRes = await query(
      `SELECT 
        (SELECT COUNT(*) FROM products WHERE shop_id = $1) AS total_products,
        (SELECT COUNT(*) FROM order_items WHERE shop_id = $1) AS total_orders,
        (SELECT COUNT(*) FROM order_items WHERE shop_id = $1 AND status = 'pending') AS pending_orders,
        (SELECT COALESCE(SUM(seller_net_amount), 0) FROM commissions WHERE shop_id = $1) AS lifetime_net_earnings
      `,
      [shop.id]
    );

    return success(res, {
      shop,
      balance,
      metrics: statsRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get seller orders (order items belonging to this shop)
 */
async function getSellerOrders(req, res, next) {
  try {
    const sRes = await query('SELECT id FROM shops WHERE seller_id = $1', [req.user.id]);
    if (sRes.rows.length === 0) return error(res, 'SHOP_NOT_FOUND', 'Shop not found', 404);

    const shopId = sRes.rows[0].id;
    const itemsRes = await query(
      `SELECT 
        oi.id AS order_item_id,
        oi.order_id,
        oi.product_name,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        oi.status AS item_status,
        oi.created_at,
        o.order_number,
        o.shipping_address,
        o.payment_method,
        o.payment_status,
        c.commission_amount,
        c.seller_net_amount
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       LEFT JOIN commissions c ON c.order_item_id = oi.id
       WHERE oi.shop_id = $1
       ORDER BY oi.created_at DESC`,
      [shopId]
    );

    return success(res, itemsRes.rows);
  } catch (err) {
    next(err);
  }
}

/**
 * Update order item status (processing -> shipped -> delivered)
 */
async function updateOrderItemStatus(req, res, next) {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return error(res, 'INVALID_STATUS', 'Invalid status update', 400);
    }

    const sRes = await query('SELECT id FROM shops WHERE seller_id = $1', [req.user.id]);
    const shopId = sRes.rows[0].id;

    const itemRes = await query(
      'SELECT * FROM order_items WHERE id = $1 AND shop_id = $2',
      [itemId, shopId]
    );

    if (itemRes.rows.length === 0) {
      return error(res, 'ITEM_NOT_FOUND', 'Order item not found for this shop', 404);
    }

    const item = itemRes.rows[0];

    await transaction(async (client) => {
      await client.query('UPDATE order_items SET status = $1 WHERE id = $2', [status, itemId]);

      // If delivered, move pending balance to current balance
      if (status === 'delivered') {
        const commRes = await client.query('SELECT seller_net_amount FROM commissions WHERE order_item_id = $1', [itemId]);
        if (commRes.rows.length > 0) {
          const net = parseFloat(commRes.rows[0].seller_net_amount);
          await client.query(
            `UPDATE seller_balances 
             SET current_balance = current_balance + $1,
                 pending_balance = GREATEST(0, pending_balance - $1),
                 total_earned = total_earned + $1,
                 updated_at = NOW()
             WHERE seller_id = $2`,
            [net, req.user.id]
          );
        }
      }
    });

    return success(res, { message: `Order item updated to ${status}` });
  } catch (err) {
    next(err);
  }
}

/**
 * Add payout account (bKash, Nagad, Rocket, Bank)
 */
async function addPayoutAccount(req, res, next) {
  try {
    const { account_type, account_name, account_number, bank_name, branch_name, routing_number } = req.body;
    if (!account_type || !account_name || !account_number) {
      return error(res, 'MISSING_FIELDS', 'Account type, name, and number are required', 400);
    }

    const resAcc = await query(
      `INSERT INTO seller_payout_accounts 
       (seller_id, account_type, account_name, account_number, bank_name, branch_name, routing_number, is_primary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING *`,
      [req.user.id, account_type, account_name, account_number, bank_name || null, branch_name || null, routing_number || null]
    );

    return success(res, resAcc.rows[0], 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Request withdrawal
 */
async function requestWithdrawal(req, res, next) {
  try {
    const { amount, payout_account_id } = req.body;
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < 500) {
      return error(res, 'MINIMUM_WITHDRAWAL', 'Minimum withdrawal amount is BDT 500.00', 400);
    }

    // Verify balance
    const bRes = await query('SELECT current_balance FROM seller_balances WHERE seller_id = $1', [req.user.id]);
    if (bRes.rows.length === 0 || parseFloat(bRes.rows[0].current_balance) < withdrawAmount) {
      return error(res, 'INSUFFICIENT_BALANCE', 'Insufficient available balance for withdrawal', 400);
    }

    const result = await transaction(async (client) => {
      // Deduct from current balance
      await client.query(
        'UPDATE seller_balances SET current_balance = current_balance - $1, updated_at = NOW() WHERE seller_id = $2',
        [withdrawAmount, req.user.id]
      );

      const wRes = await client.query(
        `INSERT INTO withdrawal_requests (seller_id, payout_account_id, amount, status)
         VALUES ($1, $2, $3, 'pending')
         RETURNING *`,
        [req.user.id, payout_account_id, withdrawAmount]
      );

      return wRes.rows[0];
    });

    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSellerDashboard,
  getSellerOrders,
  updateOrderItemStatus,
  addPayoutAccount,
  requestWithdrawal
};
