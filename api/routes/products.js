const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controller/products');

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
    if(file.mimetype==="application/octet-stream" || file.mimetype==="image/jpeg" || file.mimetype==="image/png"){
        cb(null,true);
    }
    else{
        cb(null,false);
    }
};

const upload = multer({storage : storage,fileFilter : fileFilter,limits : {
    fileSize : 1024*1024*5
}});

router.get('/',productController.product_get_all);

router.post('/',upload.array('productImages',5),productController.product_create);

router.get('/:productId',productController.product_get_product);

// router.post('/productview',productController.product_customer_productview);

router.patch('/:productId',upload.array('productImages',5),productController.product_update);

router.delete('/:productId',productController.product_delete);

router.post('/filtercategory',productController.product_filter_category);

// router.post('/search',productController.product_search);

module.exports = router;