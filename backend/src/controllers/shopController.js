const { query } = require('../config/db');
const { success, error } = require('../utils/response');

async function listShops(req, res, next) {
  try {
    const sRes = await query("SELECT * FROM shops WHERE status = 'approved' ORDER BY rating DESC, total_sales DESC");
    return success(res, sRes.rows);
  } catch (err) {
    next(err);
  }
}

async function getShopBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const sRes = await query('SELECT * FROM shops WHERE slug = $1 OR id::text = $1', [slug]);
    if (sRes.rows.length === 0) {
      return error(res, 'SHOP_NOT_FOUND', 'Shop not found', 404);
    }
    const shop = sRes.rows[0];

    const productsRes = await query(
      `SELECT p.*, 
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) AS primary_image
       FROM products p 
       WHERE p.shop_id = $1 AND p.status = 'active' 
       ORDER BY p.created_at DESC`,
      [shop.id]
    );

    return success(res, { shop, products: productsRes.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listShops,
  getShopBySlug
};
