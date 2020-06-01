const mongoose = require('mongoose');


const shopSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    shopownerId : {type : mongoose.Schema.Types.ObjectId,ref : "Shopowner",required : true},
    name : {type : String , required : true},
    district : {type : String , required : true},
    address : {type : String , required : true},
    phoneNumber : {type : String , required : true},
    shopPic : String,
    description : {type : String,required : true},
    timings : [{}],
    views : {type : Number , default : 0},
    date : {type : Date,required : true} 
});

module.exports = mongoose.model("Shop",shopSchema);