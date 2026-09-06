const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, notificationController.listNotifications);
router.put('/:id/read', authenticate, notificationController.markRead);

module.exports = router;
