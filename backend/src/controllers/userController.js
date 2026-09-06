const { query } = require('../config/db');
const { success, error } = require('../utils/response');

async function getAddresses(req, res, next) {
  try {
    const aRes = await query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [req.user.id]);
    return success(res, aRes.rows);
  } catch (err) {
    next(err);
  }
}

async function addAddress(req, res, next) {
  try {
    const { full_name, phone, alternative_phone, division, district, upazila, street_address, postal_code, is_default } = req.body;
    if (!full_name || !phone || !division || !district || !upazila || !street_address) {
      return error(res, 'MISSING_FIELDS', 'Please provide full recipient and address details', 400);
    }

    if (is_default) {
      await query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [req.user.id]);
    }

    const resAdd = await query(
      `INSERT INTO addresses 
       (user_id, full_name, phone, alternative_phone, division, district, upazila, street_address, postal_code, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.user.id, full_name, phone, alternative_phone || null, division, district, upazila, street_address, postal_code || null, Boolean(is_default)]
    );

    return success(res, resAdd.rows[0], 201);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAddresses,
  addAddress
};
