const express = require('express');
const router = express.Router();
const shopSearchController = require('../controller/shopSearches');

router.post('/',shopSearchController.shopSearch_create);

module.exports = router;