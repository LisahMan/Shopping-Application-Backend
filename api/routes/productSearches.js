const express = require('express');
const router = express.Router();
const productSearchController = require('../controller/productSearches');

router.post('/',productSearchController.productsearches_create);

module.exports = router;