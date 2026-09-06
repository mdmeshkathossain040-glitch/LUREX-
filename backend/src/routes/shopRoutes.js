const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.get('/', shopController.listShops);
router.get('/:slug', shopController.getShopBySlug);

module.exports = router;
