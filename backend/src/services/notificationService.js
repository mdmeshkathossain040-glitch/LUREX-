const { query } = require('../config/db');

class NotificationService {
  /**
   * Send in-app notification & log for push notification dispatcher
   */
  static async send({ userId, title, body, type = 'system', data = {} }) {
    try {
      const res = await query(
        `INSERT INTO notifications (user_id, title, body, type, data)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, title, body, type, JSON.stringify(data)]
      );
      console.log(`[Notification Dispatched] To: ${userId} | ${title}`);
      return res.rows[0];
    } catch (err) {
      console.error('[Notification Error]:', err.message);
      return null;
    }
  }

  static async notifyOrderCreated(order, customerId, shopIds = []) {
    await this.send({
      userId: customerId,
      title: `Order Placed Successfully (#${order.order_number})`,
      body: `Your order for BDT ${order.total_amount} has been received and is being processed.`,
      type: 'order',
      data: { orderId: order.id, orderNumber: order.order_number }
    });
  }

  static async notifyPaymentSuccess(orderId, customerId, amount, transactionId) {
    await this.send({
      userId: customerId,
      title: 'Payment Confirmed',
      body: `We received your payment of BDT ${amount}. TrxID: ${transactionId}`,
      type: 'payment',
      data: { orderId, transactionId, amount }
    });
  }

  static async notifyOrderStatusChanged(order, status, customerId) {
    await this.send({
      userId: customerId,
      title: `Order Update: #${order.order_number}`,
      body: `Your order status has been updated to: ${status.toUpperCase()}.`,
      type: 'order',
      data: { orderId: order.id, status }
    });
  }
}

module.exports = NotificationService;
