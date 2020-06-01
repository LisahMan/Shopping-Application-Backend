const mongoose = require('mongoose');
const ShopLiked = require('../models/shopLiked');
const Customer = require('../models/customer');
const Product = require('../models/product');

exports.shopliked_create = (req,res,next)=>{
  const shopLiked = new ShopLiked({
   _id : new mongoose.Types.ObjectId,
   customerId : req.body.customerId,
   shopId : req.body.shopId,
   date : req.body.date
  });

  shopLiked.save()
           .then(
               doc=>{
                   res.status(201).json({
                       message : "ShopLiked created",
                   })
               }
           )
           .catch(
               error=>{
                   if(error.code===11000){
                       res.status(409).json({
                           message : "Shop already liked"
                       })
                   }else{
                       res.status(500).json({
                           error : error
                       })
                   }
               }
           )
};

exports.get_customer_shopliked = (req,res,next)=>{
  Customer.findById(req.params.customerId)
          .exec()
          .then(
              customer=>{
                  if(!customer){
                      return res.status(200).json({
                          message : "Customer not found"
                      })
                  }

                 return ShopLiked.find({customerId : customer._id})
                           .populate('shopId')
                           .exec();             
              }
          )
          .then(
            docs=>{
                if(docs.length<1){
                    return res.status(200).json({
                        message : "No shop liked"
                    })
                }

                res.status(200).json({
                    count : docs.length,
                    shopliked :docs
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
};

exports.shopliked_delete = (req,res,next)=>{
   ShopLiked.remove({customerId : req.params.customerId,shopId : req.params.shopId})
            .exec()
            .then(
                result=>{
                    res.status(200).json({
                        message : "Shopliked removed"
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
};

exports.check_shopliked = (customerId,shopId)=>{
    return new Promise((resolve,reject)=>{
      ShopLiked.findOne({customerId : customerId,shopId : shopId})
               .exec()
               .then(doc=>{
                   if(doc){
                       resolve("yes");
                   }else{
                       resolve("no");
                   }
               })
               .catch(error=>{
                   reject(error);
               })
    });
};

exports.shopliked_products = (customerId,limit=0,category="")=>{
    return new Promise((resolve,reject)=>{
        if(limit!==0){
            limit=10;
        }

        ShopLiked.find({customerId : customerId})
        .exec()
        .then(
             shoplikeds=>{
                 if(shoplikeds.length<1){
                    resolve("No shop liked");
                 }
                const shopId = [];
                 for(const shopliked of shoplikeds){ 
                    shopId.push(shopliked.shopId);
                }
                let findProduct;
                if(category===""){
                    findProduct = {shopId : {$in : shopId}};
                }
                else{
                    findProduct = {shopId : {$in : shopId},category : category};
                }

                return Product.find(findProduct)
                              .limit(limit)
                              .populate('shopId',{'_id' : 1,'name' : 1})
                              .select('_id name shopId category typeOfProduct price negotiable color size description date productImages views')
                              .sort({date:-1})
                              .exec()   
                
            }
        )
        .then(
            docs=>{
               resolve(docs);
            }
        )
        .catch(
            error=>{
                reject(error);
            }
        )

    })
};

exports.get_shopliked_products = (req,res,next)=>{
     this.shopliked_products(req.params.customerId)
         .then(docs=>{
             if(docs==="No shop liked"){
                 res.status(200).json({
                     message : "No shop liked"
                 })
             }
             else if(docs.length<1){
                 res.status(200).json({
                     message : "Shop has no products"
                 })
             }
             else{
                 res.status(200).json({
                     products : docs
                 })
             }
         })
         .catch(error=>{
             res.status(500).json({
                 error : error
             })
         })
    };