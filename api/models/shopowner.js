const mongoose = require('mongoose');

const shopownerSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    username : {type : String , required : true,unique : true},
    password : {type : String , required : true,minlength : 8},
    mobileNumber : {type : String,required : true,minlength : 10}
});


module.exports = mongoose.model('Shopowner',shopownerSchema);