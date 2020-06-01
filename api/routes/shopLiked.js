const express = require('express');
const router = express.Router();
const shopLikedController = require('../controller/shopLiked');

router.post('/',shopLikedController.shopliked_create);

router.get('/customer/:customerId',shopLikedController.get_customer_shopliked);

router.get('/customer/:customerId/product',shopLikedController.get_shopliked_products);

router.delete('/:customerId/:shopId',shopLikedController.shopliked_delete);

module.exports = router;