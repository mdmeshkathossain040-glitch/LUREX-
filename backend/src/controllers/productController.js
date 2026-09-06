const { query, transaction } = require('../config/db');
const { success, error, AppError } = require('../utils/response');

/**
 * List products with search, filtering, and pagination
 */
async function listProducts(req, res, next) {
  try {
    const {
      q,
      category,
      shop_id,
      featured,
      min_price,
      max_price,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = ["p.status = 'active'"];
    const params = [];

    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }

    if (category) {
      params.push(category);
      conditions.push(`(c.slug = $${params.length} OR c.id::text = $${params.length})`);
    }

    if (shop_id) {
      params.push(shop_id);
      conditions.push(`p.shop_id = $${params.length}`);
    }

    if (featured === 'true') {
      conditions.push('p.is_featured = TRUE');
    }

    if (min_price) {
      params.push(parseFloat(min_price));
      conditions.push(`p.price >= $${params.length}`);
    }

    if (max_price) {
      params.push(parseFloat(max_price));
      conditions.push(`p.price <= $${params.length}`);
    }

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_low') orderBy = 'p.price ASC';
    else if (sort === 'price_high') orderBy = 'p.price DESC';
    else if (sort === 'rating') orderBy = 'p.rating DESC';
    else if (sort === 'popular') orderBy = 'p.total_reviews DESC';

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        p.*,
        c.name AS category_name,
        c.slug AS category_slug,
        s.name AS shop_name,
        s.slug AS shop_slug,
        s.logo_url AS shop_logo,
        COALESCE(
          (SELECT json_agg(json_build_object('id', pi.id, 'image_url', pi.image_url, 'is_primary', pi.is_primary))
           FROM product_images pi WHERE pi.product_id = p.id), '[]'
        ) AS images
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN shops s ON p.shop_id = s.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(parseInt(limit), offset);

    const productsRes = await query(sql, params);

    // Count query for pagination meta
    const countParams = params.slice(0, -2);
    const countSql = `
      SELECT COUNT(*) AS total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN shops s ON p.shop_id = s.id
      ${whereClause}
    `;
    const countRes = await query(countSql, countParams);
    const total = parseInt(countRes.rows[0].total);

    return success(res, productsRes.rows, 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get product detail by ID or Slug
 */
async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const sql = `
      SELECT 
        p.*,
        c.name AS category_name,
        c.slug AS category_slug,
        s.name AS shop_name,
        s.slug AS shop_slug,
        s.logo_url AS shop_logo,
        s.rating AS shop_rating,
        COALESCE(
          (SELECT json_agg(json_build_object('id', pi.id, 'image_url', pi.image_url, 'is_primary', pi.is_primary))
           FROM product_images pi WHERE pi.product_id = p.id), '[]'
        ) AS images
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN shops s ON p.shop_id = s.id
      WHERE ${isUuid ? 'p.id = $1' : 'p.slug = $1'}
    `;

    const productRes = await query(sql, [id]);
    if (productRes.rows.length === 0) {
      return error(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);
    }

    return success(res, productRes.rows[0]);
  } catch (err) {
    next(err);
  }
}

/**
 * Create product (Seller only)
 */
async function createProduct(req, res, next) {
  try {
    const { name, category_id, description, price, discount_price, stock_quantity, images = [], is_featured = false } = req.body;

    // Verify user owns an approved shop
    const shopRes = await query('SELECT * FROM shops WHERE seller_id = $1', [req.user.id]);
    if (shopRes.rows.length === 0) {
      return error(res, 'NO_SHOP_FOUND', 'You must create a shop before adding products', 403);
    }

    const shop = shopRes.rows[0];
    if (shop.status === 'suspended') {
      return error(res, 'SHOP_SUSPENDED', 'Your shop has been suspended', 403);
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
    const sku = 'SKU-' + Date.now().toString().slice(-6);

    const result = await transaction(async (client) => {
      const pRes = await client.query(
        `INSERT INTO products (shop_id, category_id, name, slug, description, price, discount_price, stock_quantity, sku, is_featured, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
         RETURNING *`,
        [shop.id, category_id, name, slug, description, price, discount_price || null, stock_quantity || 1, sku, is_featured]
      );
      const product = pRes.rows[0];

      // Insert images
      if (Array.isArray(images) && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await client.query(
            `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
             VALUES ($1, $2, $3, $4)`,
            [product.id, images[i], i === 0, i]
          );
        }
      }

      return product;
    });

    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Update product (Seller owner or Admin)
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, price, discount_price, stock_quantity, description, status, is_featured } = req.body;

    // Verify ownership
    const pCheck = await query(
      `SELECT p.*, s.seller_id FROM products p JOIN shops s ON p.shop_id = s.id WHERE p.id = $1`,
      [id]
    );
    if (pCheck.rows.length === 0) {
      return error(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);
    }

    if (req.user.role !== 'admin' && pCheck.rows[0].seller_id !== req.user.id) {
      return error(res, 'FORBIDDEN', 'You can only edit products belonging to your shop', 403);
    }

    const updated = await query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           price = COALESCE($2, price),
           discount_price = COALESCE($3, discount_price),
           stock_quantity = COALESCE($4, stock_quantity),
           description = COALESCE($5, description),
           status = COALESCE($6, status),
           is_featured = COALESCE($7, is_featured),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [name, price, discount_price, stock_quantity, description, status, is_featured, id]
    );

    return success(res, updated.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct
};
