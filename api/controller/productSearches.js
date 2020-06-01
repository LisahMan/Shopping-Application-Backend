const mongoose = require('mongoose');
const ProductSearch = require('../models/productSearch');
const Product = require('../models/product');

exports.productsearches_create = (req,res,next)=>{
    const searchItem = req.body.searchItem; 
    const searchObj = {$regex : searchItem,$options : 'i'};

    const productSearch = new ProductSearch({
        _id : new mongoose.Types.ObjectId,
        customerId : req.body.customerId,
        searchItem : searchItem,
        date : req.body.date
    });

    productSearch.save()
                .then(result=>{
                    return Product.find({$or : [{name: searchObj } , {category: searchItem } , {typeOfProduct: searchObj}]})
                    .populate('shopId',{'_id' : 1,'name' : 1})
                    .select('_id name shopId category typeOfProduct price negotiable color size description date productImages views')
                    .sort({'date' : '-1'})
                    .exec()
                })
                .then(
                    docs=>{
                        if(docs.length<1){
                            return res.status(200).json({
                                message : "No product found"
                            });
                        }
                        res.status(200).json({
                            count : docs.length,
                            products : docs
                        })
                    }
                )
                .catch(error=>{
                    res.status(500).json({
                        error : error
                    })
                })   
}