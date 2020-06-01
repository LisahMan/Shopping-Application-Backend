const mongoose = require('mongoose');

const bagSchema = mongoose.Schema({
 _id : mongoose.Schema.Types.ObjectId,
 customerId : {type : mongoose.Schema.Types.ObjectId,ref : "Customer",required : true,unique : false},
 productId : {type : mongoose.Schema.Types.ObjectId,ref : "Product",required : true,unique : false},
 date : {type : Date,required : true}
});

bagSchema.index({customerId : 1 , productId : 1},{unique : true});

module.exports = mongoose.model('Bag',bagSchema);