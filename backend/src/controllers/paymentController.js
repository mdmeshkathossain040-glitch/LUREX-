const { query, transaction } = require('../config/db');
const { success, error } = require('../utils/response');
const { getPaymentProvider } = require('../services/payment');
const NotificationService = require('../services/notificationService');

/**
 * Handle payment return callback (from bKash/Nagad/Rocket redirect)
 */
async function handleCallback(req, res, next) {
  try {
    const { provider: providerName } = req.params;
    const provider = getPaymentProvider(providerName);
    const callbackData = { ...req.query, ...req.body };

    const result = await provider.handleCallback(callbackData);

    if (!result.success) {
      return error(res, 'PAYMENT_FAILED', `Payment via ${providerName} was unsuccessful or cancelled.`, 400, result);
    }

    // Find payment record
    const paymentId = callbackData.paymentID || callbackData.payment_id || callbackData.paymentRefId || callbackData.orderId;
    let pRes = await query('SELECT * FROM payments WHERE transaction_id = $1 OR id::text = $1 LIMIT 1', [paymentId]);

    if (pRes.rows.length === 0 && callbackData.orderId) {
      pRes = await query('SELECT * FROM payments WHERE order_id = $1 LIMIT 1', [callbackData.orderId]);
    }

    if (pRes.rows.length > 0) {
      const payment = pRes.rows[0];

      await transaction(async (client) => {
        // Update payment
        await client.query(
          `UPDATE payments 
           SET status = 'completed', 
               transaction_id = COALESCE($1, transaction_id),
               updated_at = NOW() 
           WHERE id = $2`,
          [result.transactionId, payment.id]
        );

        // Record transaction log
        await client.query(
          `INSERT INTO payment_transactions (payment_id, action, amount, provider_response, status)
           VALUES ($1, 'callback', $2, $3, 'completed')`,
          [payment.id, payment.amount, JSON.stringify(result)]
        );

        // Update order status
        await client.query(
          `UPDATE orders 
           SET payment_status = 'paid', status = 'confirmed', updated_at = NOW() 
           WHERE id = $1`,
          [payment.order_id]
        );
      });

      // Dispatch Notification
      const oRes = await query('SELECT customer_id FROM orders WHERE id = $1', [payment.order_id]);
      if (oRes.rows.length > 0) {
        await NotificationService.notifyPaymentSuccess(
          payment.order_id, 
          oRes.rows[0].customer_id, 
          payment.amount, 
          result.transactionId
        );
      }
    }

    return success(res, {
      message: 'Payment completed successfully',
      provider: providerName,
      transactionId: result.transactionId,
      status: 'completed'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Handle asynchronous payment webhook
 */
async function handleWebhook(req, res, next) {
  try {
    const { provider: providerName } = req.params;
    const provider = getPaymentProvider(providerName);

    const result = await provider.handleWebhook(req.body, req.headers);
    if (!result.verified) {
      return error(res, 'INVALID_SIGNATURE', 'Cryptographic webhook signature verification failed', 400);
    }

    console.log(`[Webhook Verified] Provider: ${providerName}, Trx: ${result.transactionId}`);
    return success(res, { received: true, verified: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleCallback,
  handleWebhook
};
