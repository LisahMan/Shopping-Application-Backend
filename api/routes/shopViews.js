const express = require('express');
const router = express.Router();
const shopViewController = require('../controller/shopViews');

router.post('/',shopViewController.shopview_create);
router.get('/trending',shopViewController.shopview_trending_shops);

module.exports = router;