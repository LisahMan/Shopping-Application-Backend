const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  _id : mongoose.Schema.Types.ObjectId,
  shopId : {type : mongoose.Schema.Types.ObjectId,ref : "Shop",required : true},
  name : {type : String , required : true},
  category : {type : String , required : true},
  typeOfProduct : {type : String , required : true},
  price : {type : Number,default : 0},
  negotiable : {type : Boolean,default : false},
  description : {type : String , required : true},
  color : {type : String ,required : true},
  size : {type : String , required : true},
  productImages : [{type : String,required : true}],
  views : {type : Number , default : 0},
  date : {type : Date,required : true}
});

module.exports = mongoose.model("Product",productSchema);