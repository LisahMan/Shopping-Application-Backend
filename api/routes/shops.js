const express = require('express');
const router = express.Router();
const multer = require('multer');
const shopController = require('../controller/shops');

const storage = multer.diskStorage(
    {
        destination : (req,file,cb)=>{
            cb(null,'uploads/');
        },

        filename : (req,file,cb)=>{
            cb(null,new Date().toISOString().replace(/:/g, '-') + file.originalname);
        }
    }
);

const fileFilter = (req,file,cb)=>{

    if(file.mimetype==="application/octet-stream" || file.mimetype==="image/jpeg" || file.mimetype==="image/jpg" || file.mimetype==="image/png"){
        cb(null,true);
    }
    else{
        cb(null,false);
    }
};

const upload = multer({storage : storage,fileFilter : fileFilter,limits : {
    fileSize : 1024*1024*5
}});

router.get('/',shopController.shop_get_all);

router.get('/:shopId',shopController.shop_get_shop);

router.post('/',upload.single('shopPic'),shopController.shop_create);

// router.post('/search',shopController.shop_search);

// router.post('/shopview',shopController.shop_customer_shopview);

router.get('/:shopId/product/',shopController.shop_get_product);

router.patch('/:shopId',upload.single('shopPic'),shopController.shop_update);

router.delete('/:shopId',shopController.shop_delete);

module.exports = router;