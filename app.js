const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shopownerRouter = require('./api/routes/shopowners');
const customerRouter = require('./api/routes/customers');
const shopRouter = require('./api/routes/shops');
const productRouter = require('./api/routes/products');
const bagRouter = require('./api/routes/bags');
const shopLikedRouter = require('./api/routes/shopLiked');
const productViewRouter = require('./api/routes/productViews');
const shopViewRouter = require('./api/routes/shopViews');
const productSearchRouter = require('./api/routes/productSearches');
const shopSearchRouter = require('./api/routes/shopSearches');

mongoose.connect('mongodb+srv://node-shop:'+process.env.ATLAS_PASSWORD+'@cluster0-yk4rh.mongodb.net/test?retryWrites=true&w=majority',{useNewUrlParser:true});
mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use('/uploads',express.static('uploads'));

app.use('/shopowner',shopownerRouter);
app.use('/customer',customerRouter);
app.use('/shop',shopRouter);
app.use('/product',productRouter);
app.use('/bag',bagRouter);
app.use('/shopliked',shopLikedRouter);
app.use('/productview',productViewRouter);
app.use('/shopview',shopViewRouter);
app.use('/productsearch',productSearchRouter);
app.use('/shopsearch',shopSearchRouter);

app.use((req,res,next)=>{
 const error = new Error('Page not found');
 error.status = 404;
 next(error);
});

app.use((error,req,res,next)=>{
    res.status(error.status).json({
        error : error.message
    })
});

module.exports = app;
