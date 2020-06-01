const mongoose = require('mongoose');
const ShopSearch = require('../models/shopSearch');
const Shop = require('../models/shop');

exports.shopSearch_create = (req,res,next)=>{

    const searchObj = {$regex : req.body.searchItem,$options : 'i'};

    const shopSearch = new ShopSearch({
        _id : new mongoose.Types.ObjectId,
        customerId : req.body.customerId,
        searchItem : req.body.searchItem,
        date : req.body.date
    });

    shopSearch.save()
            .then(result=>{
               return Shop.find({$or : [{name : searchObj},{district : searchObj},{address : searchObj}]})
                .sort({'date' : '-1'})
                .exec()
            })
            .then(
                docs=>{
                    if(docs.length<1){
                        return res.status(200).json({
                            message : "No shop found"
                        })
                    }
                    
                    res.status(200).json({
                        count : docs.length,
                        shops : docs
                    }) 
                }
            )
            .catch(
                error=>{
                    res.status(500).json({
                        error : error
                    })
                }
            )     
}