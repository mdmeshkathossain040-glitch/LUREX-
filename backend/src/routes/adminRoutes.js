const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('admin'));

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.listUsers);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.get('/shops', adminController.listShops);
router.put('/shops/:id/status', adminController.updateShopStatus);
router.get('/withdrawals', adminController.listWithdrawals);
router.put('/withdrawals/:id/process', adminController.processWithdrawal);

module.exports = router;
