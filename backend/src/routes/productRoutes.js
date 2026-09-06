const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);
router.post('/', authenticate, requireRole('seller', 'admin'), productController.createProduct);
router.put('/:id', authenticate, requireRole('seller', 'admin'), productController.updateProduct);

module.exports = router;
