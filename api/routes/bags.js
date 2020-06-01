const express = require('express');
const router = express.Router();
const bagController = require('../controller/bags');


router.post('/',bagController.bag_create);

router.get('/customer/:customerId',bagController.get_customer_bag);

router.get('/shop/:shopId',bagController.bag_shop);

router.delete('/:bagId',bagController.bag_delete);

module.exports = router;

