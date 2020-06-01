const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
 _id : mongoose.Schema.Types.ObjectId,
 username : {type : String , required : true , unique : true},
 password : {type : String , required : true , minlength : 8},
 mobileNumber : {type : String ,required : true , minlength : 10 },
 dob : {type : Date ,required : true},
 district : {type : String , required : true},
 address : {type : String , required : true},
 sex : {type : String,required : true}
});

module.exports = mongoose.model("Customer",customerSchema);