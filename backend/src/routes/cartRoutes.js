const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, cartController.getCart);
router.post('/items', authenticate, cartController.addToCart);
router.put('/items/:itemId', authenticate, cartController.updateCartItem);
router.delete('/items/:itemId', authenticate, cartController.removeCartItem);

module.exports = router;
