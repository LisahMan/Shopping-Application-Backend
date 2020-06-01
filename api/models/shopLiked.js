const mongoose = require('mongoose');

const shopLikedSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    customerId : {type : mongoose.Schema.Types.ObjectId,ref : "Customer",required : true,unique:false},
    shopId : {type : mongoose.Schema.Types.ObjectId,ref : "Shop",required : true,unique : false},
    date : {type : Date,required : true}
});

shopLikedSchema.index({customerId : 1,shopId : 1},{unique : true});

module.exports = mongoose.model('ShopLiked',shopLikedSchema);