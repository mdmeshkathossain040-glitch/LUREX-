const { query } = require('../config/db');
const { success, error } = require('../utils/response');

async function getOrCreateCart(userId) {
  let cartRes = await query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  if (cartRes.rows.length === 0) {
    cartRes = await query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
  }
  return cartRes.rows[0];
}

/**
 * Get active cart
 */
async function getCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user.id);

    const itemsRes = await query(
      `SELECT 
        ci.id AS cart_item_id,
        ci.quantity,
        p.id AS product_id,
        p.name,
        p.price,
        p.discount_price,
        p.stock_quantity,
        s.id AS shop_id,
        s.name AS shop_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) AS image_url
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN shops s ON p.shop_id = s.id
       WHERE ci.cart_id = $1`,
      [cart.id]
    );

    let subtotal = 0;
    const items = itemsRes.rows.map(item => {
      const activePrice = item.discount_price ? parseFloat(item.discount_price) : parseFloat(item.price);
      const itemTotal = activePrice * item.quantity;
      subtotal += itemTotal;
      return {
        ...item,
        unit_price: activePrice,
        total_price: itemTotal
      };
    });

    const deliveryCharge = items.length > 0 ? 60.00 : 0.00; // Flat BDT 60 inside Dhaka / standard
    const total = subtotal + deliveryCharge;

    return success(res, {
      cartId: cart.id,
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      deliveryCharge,
      total: parseFloat(total.toFixed(2)),
      itemCount: items.reduce((acc, item) => acc + item.quantity, 0)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add item to cart
 */
async function addToCart(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId || quantity < 1) {
      return error(res, 'INVALID_INPUT', 'Valid productId and positive quantity required', 400);
    }

    // Verify product exists and has stock
    const pRes = await query('SELECT * FROM products WHERE id = $1 AND status = \'active\'', [productId]);
    if (pRes.rows.length === 0) {
      return error(res, 'PRODUCT_NOT_FOUND', 'Product not available', 404);
    }

    const product = pRes.rows[0];
    if (product.stock_quantity < quantity) {
      return error(res, 'OUT_OF_STOCK', `Only ${product.stock_quantity} items remaining in stock`, 400);
    }

    const cart = await getOrCreateCart(req.user.id);

    await query(
      `INSERT INTO cart_items (cart_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id) 
       DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = NOW()`,
      [cart.id, productId, quantity]
    );

    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
}

/**
 * Update quantity
 */
async function updateCartItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await query('DELETE FROM cart_items WHERE id = $1', [itemId]);
    } else {
      await query('UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2', [quantity, itemId]);
    }

    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
}

/**
 * Remove item
 */
async function removeCartItem(req, res, next) {
  try {
    const { itemId } = req.params;
    await query('DELETE FROM cart_items WHERE id = $1', [itemId]);
    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
};
