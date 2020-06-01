const express = require('express');
const router = express.Router();
const customerController = require('../controller/customers');

router.get('/',customerController.customer_get_all);

router.get('/:customerId',customerController.customer_get_customer);

router.get('/:customerId/homepage/:category',customerController.customer_homepage);

router.post('/signup',customerController.customer_signup);

router.post('/login',customerController.customer_login);

router.patch('/resetpassword',customerController.customer_reset_password);

router.patch('/:customerId',customerController.customer_update);

router.delete('/:customerId',customerController.customer_delete);

module.exports = router;