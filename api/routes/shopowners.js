const express = require('express');
const router = express.Router();
const shopownerController = require('../controller/shopowners');

router.get('/',shopownerController.shopowner_get_all);

router.get('/:shopownerId',shopownerController.shopowner_get_shopowner);

router.post('/signup',shopownerController.shopowner_signup);

router.post('/login',shopownerController.shopwoner_login);

router.patch('/resetpassword',shopownerController.shopowner_reset_password);

router.patch('/:shopownerId',shopownerController.shopowner_update);

router.delete('/:shopownerId',shopownerController.shopowner_delete);

module.exports = router;
