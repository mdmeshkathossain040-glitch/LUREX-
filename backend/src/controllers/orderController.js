const { query, transaction } = require('../config/db');
const { success, error, AppError } = require('../utils/response');
const config = require('../config/env');
const NotificationService = require('../services/notificationService');
const { getPaymentProvider } = require('../services/payment');

/**
 * Create order / Checkout with atomic row locking and stock verification
 */
async function checkout(req, res, next) {
  try {
    const {
      shippingAddress,
      paymentMethod = 'bkash',
      couponCode,
      notes
    } = req.body;

    if (!shippingAddress || !shippingAddress.phone || !shippingAddress.street_address) {
      return error(res, 'MISSING_ADDRESS', 'Complete shipping address and contact phone are required', 400);
    }

    // Retrieve active cart items
    const cartRes = await query('SELECT id FROM carts WHERE user_id = $1', [req.user.id]);
    if (cartRes.rows.length === 0) {
      return error(res, 'EMPTY_CART', 'Your shopping cart is empty', 400);
    }

    const cartId = cartRes.rows[0].id;
    const cartItemsRes = await query(
      'SELECT product_id, quantity FROM cart_items WHERE cart_id = $1',
      [cartId]
    );

    if (cartItemsRes.rows.length === 0) {
      return error(res, 'EMPTY_CART', 'Your shopping cart is empty', 400);
    }

    const orderNumber = 'LRX-' + Date.now().toString().slice(-8) + '-' + Math.floor(100 + Math.random() * 900);

    const result = await transaction(async (client) => {
      let subtotal = 0;
      const orderItemsToInsert = [];

      // 1. Lock each product row with FOR UPDATE to prevent race conditions and over-selling
      for (const item of cartItemsRes.rows) {
        const prodRes = await client.query(
          `SELECT id, name, price, discount_price, stock_quantity, shop_id, status 
           FROM products 
           WHERE id = $1 FOR UPDATE`,
          [item.product_id]
        );

        if (prodRes.rows.length === 0) {
          throw new AppError('PRODUCT_NOT_FOUND', `Product with ID ${item.product_id} no longer exists`, 400);
        }

        const product = prodRes.rows[0];

        if (product.status !== 'active') {
          throw new AppError('PRODUCT_INACTIVE', `Product "${product.name}" is not currently available for purchase`, 400);
        }

        if (product.stock_quantity < item.quantity) {
          throw new AppError('INSUFFICIENT_STOCK', `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}`, 400);
        }

        // Atomically deduct stock
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [item.quantity, product.id]
        );

        const activePrice = product.discount_price ? parseFloat(product.discount_price) : parseFloat(product.price);
        const itemTotal = activePrice * item.quantity;
        subtotal += itemTotal;

        orderItemsToInsert.push({
          productId: product.id,
          shopId: product.shop_id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: activePrice,
          totalPrice: itemTotal
        });
      }

      // Check coupon discount
      let discountAmount = 0.00;
      if (couponCode) {
        const coupRes = await client.query(
          `SELECT * FROM coupons 
           WHERE code = $1 AND is_active = TRUE AND valid_until > NOW() FOR UPDATE`,
          [couponCode]
        );
        if (coupRes.rows.length > 0) {
          const coupon = coupRes.rows[0];
          if (subtotal >= parseFloat(coupon.min_purchase_amount)) {
            if (coupon.discount_type === 'fixed') {
              discountAmount = Math.min(parseFloat(coupon.discount_value), subtotal);
            } else {
              discountAmount = (subtotal * parseFloat(coupon.discount_value)) / 100;
              if (coupon.max_discount_amount) {
                discountAmount = Math.min(discountAmount, parseFloat(coupon.max_discount_amount));
              }
            }
            // Increment coupon usage
            await client.query('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = $1', [coupon.id]);
          }
        }
      }

      const deliveryCharge = 60.00; // standard Bangladesh courier rate
      const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);

      // 2. Insert Order
      const initialStatus = paymentMethod === 'cod' ? 'confirmed' : 'pending';
      const initialPaymentStatus = paymentMethod === 'cod' ? 'unpaid' : 'unpaid';

      const orderRes = await client.query(
        `INSERT INTO orders (
          order_number, customer_id, shipping_address, subtotal, discount_amount, 
          delivery_charge, total_amount, status, payment_status, payment_method, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          orderNumber,
          req.user.id,
          JSON.stringify(shippingAddress),
          subtotal,
          discountAmount,
          deliveryCharge,
          totalAmount,
          initialStatus,
          initialPaymentStatus,
          paymentMethod,
          notes || null
        ]
      );
      const order = orderRes.rows[0];

      // 3. Insert Order Items & Record Commission
      const commissionRate = config.MARKETPLACE_COMMISSION_RATE;
      for (const item of orderItemsToInsert) {
        const itemRes = await client.query(
          `INSERT INTO order_items (
            order_id, product_id, shop_id, product_name, quantity, unit_price, total_price, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
          RETURNING id`,
          [order.id, item.productId, item.shopId, item.productName, item.quantity, item.unitPrice, item.totalPrice]
        );

        const orderItemId = itemRes.rows[0].id;
        const commissionAmount = parseFloat((item.totalPrice * commissionRate).toFixed(2));
        const sellerNetAmount = parseFloat((item.totalPrice - commissionAmount).toFixed(2));

        // Insert commission record
        await client.query(
          `INSERT INTO commissions (
            order_id, order_item_id, shop_id, order_amount, commission_rate, commission_amount, seller_net_amount
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [order.id, orderItemId, item.shopId, item.totalPrice, commissionRate, commissionAmount, sellerNetAmount]
        );

        // Update seller pending balance
        await client.query(
          `UPDATE seller_balances sb
           SET pending_balance = pending_balance + $1, updated_at = NOW()
           FROM shops s
           WHERE s.id = $2 AND sb.seller_id = s.seller_id`,
          [sellerNetAmount, item.shopId]
        );
      }

      // 4. Create Initial Payment Record
      await client.query(
        `INSERT INTO payments (order_id, payment_method, amount, currency, status)
         VALUES ($1, $2, $3, 'BDT', $4)`,
        [order.id, paymentMethod, totalAmount, paymentMethod === 'cod' ? 'pending' : 'initiated']
      );

      // 5. Clear the User's Cart
      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

      return { order, totalAmount };
    });

    // 6. Initialize Payment Gateway if Online
    let paymentGatewayInfo = null;
    try {
      const provider = getPaymentProvider(paymentMethod);
      paymentGatewayInfo = await provider.initializePayment({
        orderId: result.order.id,
        orderNumber: result.order.order_number,
        amount: result.totalAmount,
        currency: 'BDT',
        customerPhone: req.user.phone,
        customerEmail: req.user.email
      });
    } catch (err) {
      console.warn('[Payment Gateway Init Warning]:', err.message);
    }

    // 7. Send Notification
    await NotificationService.notifyOrderCreated(result.order, req.user.id);

    return success(res, {
      order: result.order,
      payment: paymentGatewayInfo
    }, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * List orders for customer
 */
async function getMyOrders(req, res, next) {
  try {
    const ordersRes = await query(
      `SELECT 
        o.*,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', oi.id,
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total_price', oi.total_price,
            'status', oi.status,
            'shop_name', (SELECT name FROM shops WHERE id = oi.shop_id)
          )) FROM order_items oi WHERE oi.order_id = o.id), '[]'
        ) AS items
       FROM orders o
       WHERE o.customer_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    return success(res, ordersRes.rows);
  } catch (err) {
    next(err);
  }
}

/**
 * Get order by ID with details
 */
async function getOrderDetails(req, res, next) {
  try {
    const { id } = req.params;
    const orderRes = await query(
      `SELECT 
        o.*,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total_price', oi.total_price,
            'status', oi.status,
            'shop_id', oi.shop_id,
            'shop_name', (SELECT name FROM shops WHERE id = oi.shop_id)
          )) FROM order_items oi WHERE oi.order_id = o.id), '[]'
        ) AS items,
        (SELECT json_build_object('id', p.id, 'status', p.status, 'transaction_id', p.transaction_id, 'payment_method', p.payment_method)
         FROM payments p WHERE p.order_id = o.id LIMIT 1) AS payment_info
       FROM orders o
       WHERE o.id = $1 OR o.order_number = $1`,
      [id]
    );

    if (orderRes.rows.length === 0) {
      return error(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    }

    const order = orderRes.rows[0];
    if (req.user.role !== 'admin' && order.customer_id !== req.user.id) {
      return error(res, 'FORBIDDEN', 'Access denied to this order', 403);
    }

    return success(res, order);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  checkout,
  getMyOrders,
  getOrderDetails
};
