const { query } = require('../config/db');
const { success } = require('../utils/response');

async function listCategories(req, res, next) {
  try {
    const catRes = await query(
      'SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order ASC, name ASC'
    );
    return success(res, catRes.rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories };
