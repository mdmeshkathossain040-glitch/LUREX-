const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.all('/callback/:provider', paymentController.handleCallback);
router.post('/webhook/:provider', paymentController.handleWebhook);

module.exports = router;
