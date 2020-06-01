const mongoose = require('mongoose');

const productSearchSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    customerId : {type : mongoose.Schema.Types.ObjectId,ref : 'Customer',required : true},
    searchItem : {type : String,required : true},
    date : {type : Date,required : true}
});

module.exports = mongoose.model('ProductSearch',productSearchSchema);