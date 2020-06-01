const express = require('express');
const router = express.Router();
const productViewController = require('../controller/productViews');

router.post('/',productViewController.productview_create);
router.get('/trending',productViewController.productview_trending_products);
router.get('/shop/:shopId/trending',productViewController.productview_shop_trending_products);

module.exports = router;
