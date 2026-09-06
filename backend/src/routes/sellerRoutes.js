const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/dashboard', authenticate, requireRole('seller'), sellerController.getSellerDashboard);
router.get('/orders', authenticate, requireRole('seller'), sellerController.getSellerOrders);
router.put('/orders/:itemId/status', authenticate, requireRole('seller'), sellerController.updateOrderItemStatus);
router.post('/payout-accounts', authenticate, requireRole('seller'), sellerController.addPayoutAccount);
router.post('/withdrawals', authenticate, requireRole('seller'), sellerController.requestWithdrawal);

module.exports = router;
