const { query } = require('../config/db');
const { success } = require('../utils/response');

async function listNotifications(req, res, next) {
  try {
    const nRes = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    return success(res, nRes.rows);
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [req.user.id]);
    } else {
      await query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    }
    return success(res, { message: 'Notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listNotifications,
  markRead
};
