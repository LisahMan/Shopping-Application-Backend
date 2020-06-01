const ProductView = require('../models/productView');
const Product = require('../models/product');
const mongoose = require('mongoose');

exports.create_productview = (customerId,productId,date)=>{
    return new Promise((resolve,reject)=>{
        ProductView.findOne({customerId,productId,date})
        .exec()
        .then(
            doc=>{
                if(doc){
                    resolve("Already viewed");
                }

                const productView = new ProductView({
                    _id : new mongoose.Types.ObjectId,
                    customerId : customerId,
                    productId : productId,
                    date : date
                });

                productView.save()
                .then(
                    result=>{
                        return Product.update({_id : productId},{$inc : {views : 1}}).exec()
                    }
                )
                .then(
                    result=>{
                        resolve("Ok");
                    }
                )
                .catch(
                    error=>{
                        reject(error);
                    }
                )
                
            }
        )
        .catch(error=>{
            reject(error);
        })
    })
}

exports.productview_create = (req,res,next)=>{
  ProductView.findOne({customerId:req.body.customerId,productId:req.body.productId,date : req.body.date})
             .exec()
             .then(
                 doc=>{
                     if(doc){
                     return res.status(200).json({
                      message : "Already viewed"
                     })    
                     }
                        const productView = new ProductView({
                            _id : new mongoose.Types.ObjectId,
                            customerId : req.body.customerId,
                            productId : req.body.productId,
                            date : req.body.date
                        });
    
                       productView.save()
                       .then(result=>{
                        return  Product.update({_id : req.body.productId},{$inc : {views : 1}}).exec();
                      }               
                      ) 
                      .then(result=>{
                             res.status(200).json({
                              message : "Ok"
                          })
                      })
                      .catch(error=>{
                          res.status(500).json({
                              error : error
                          })
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

exports.trending_products = (limit=0,category="",shopId="")=>{
    return new Promise((resolve,reject)=>{
        let productMatch;
        if(category!==""&&shopId!==""){
            productMatch = {$match : {$expr : {$eq : ["$_id" ,"$$productId"]},category : category,shopId : mongoose.Types.ObjectId(shopId)}};
        }
        else if(category!==""){
            productMatch = {$match : {$expr : {$eq : ["$_id" ,"$$productId"]},category : category}};     
        }
        else if(shopId!==""){
            productMatch = {$match : {$expr : {$eq : ["$_id" ,"$$productId"]},shopId : mongoose.Types.ObjectId(shopId)}};
        }
        else{
            productMatch = {$match : {$expr : {$eq : ["$_id" ,"$$productId"]}}};
        }
        
         let pipeline = [
            {$match : {
                date : {
                    $gte : new Date(new Date() -7*60*60*24*1000)
                }
            }},
            {$group : {
                _id : "$productId",
                count : {$sum : 1},
            }},
            {$lookup : {
                from : "products",
                let : {"productId" : "$_id"},
                pipeline : [
                    productMatch,
                    {$project : {_id:1 ,name:1,shopId:1, category:1, typeOfProduct:1, price:1, negotiable:1, color:1, size:1, description:1, date:1, productImages:1, views:1}},
                    {$lookup : {
                        from : "shops",
                        let : {"shopId" : "$shopId"},
                        pipeline : [
                            {$match : {$expr : {$eq : ["$_id","$$shopId"]}}},
                            {$project : {_id:1 ,name:1}}
                        ],
                        as : "shop"
                    }},
                   {$unwind : "$shop"}
                ],
                as : "product"
            }},

            {$unwind : "$product"}
     
        
        ];

        if(limit!==0){
            pipeline.push({$limit : limit});
        }

         ProductView.aggregate(pipeline)
                    .sort({count:-1})
                    .exec()
                    .then(docs=>{
                        resolve(docs);
                    })
                    .catch(error=>{
                    reject(error);
                    })
    });
}

exports.productview_trending_products = (req,res,next)=>{
    this.trending_products()
        .then(docs=>{
          if(docs.length<1){
              return res.status(200).json({
                  message : "No trending products"
              })
          }
          res.status(200).json({
              trendingProducts : docs
          })
        })
        .catch(error=>{
            res.status(500).json({
                error : error
            })
        })
}

exports.productview_shop_trending_products = (req,res,next)=>{
    this.trending_products(0,"",req.params.shopId)
        .then(docs=>{
            if(docs.length<1){
                return res.status(200).json({
                    message : "No trending products"
                })
            }
            res.status(200).json({
                trendingProducts : docs
            })
        })
        .catch(error=>{
            res.status(500).json({
                error : error
            })
        })
}