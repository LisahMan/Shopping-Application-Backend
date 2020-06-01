const mongoose = require('mongoose');
const Shop = require('../models/shop');
const Product = require('../models/product');
const productController = require('../controller/products');
const shopViewConstroller = require('../controller/shopViews');
const shopLikedController = require('../controller/shopLiked');
const shopSearchController = require('../controller/shopSearches');
const fs = require('fs');


exports.shop_remove = (shop)=>{
    return new Promise(async (resolve,reject)=>{
        try{
             const products = await Product.find({shopId : shop._id});
            if(products.length>0){
                for(const product of products){
                     await productController.product_remove(product);
                     }    
                    }
            
                    if(shop.shopPic){
                          await fs.unlink(shop.shopPic,(err)=>{
                              if(err){
                                  reject(err);
                              }
                          });
                    }
                    
                    shop.remove((err,doc)=>{
                        if(err){
                            reject(err);
                        }
                        else{
                            resolve(null);
                        }
                    })
                     }
                catch(error){
                  reject(error);                  
                }
    });
}

exports.shop_get_all = (req,res,next)=>{
  Shop.find()
      .exec()
      .then(
          docs=>{
              res.status(200).json({
                  count : docs.length,
                  shops : docs
              })
          }
      )
      .catch(error=>{
          res.status(500).json({
              error : error
          })
      })
};

exports.shop_create = (req,res,next)=>{
    Shop.findOne({shopownerId : req.body.shopownerId})
        .exec()
        .then(
            doc=>{
                
                if(doc){
                    console.log("Not here");
                    if(req.file!=undefined){
                        fs.unlink(req.file.path,(err)=>{
                            if(err){
                                res.status(500).json({
                                    error : err
                                })
                            }
                        });
                    }
                    return res.status(409).json({
                        message : "Shopowner already has a shop"
                    })
                }
                        
                const shop = new Shop({
                    _id : new mongoose.Types.ObjectId,
                    shopownerId : req.body.shopownerId,
                    name : req.body.name,
                    district : req.body.district,
                    address : req.body.address,
                    phoneNumber : req.body.phoneNumber,
                    description : req.body.description,
                    timings : JSON.parse(req.body.timings), 
                    date : req.body.date,
                 });

                
                if(req.file!==undefined){
                    shop['shopPic'] = req.file.path;
                }

            
              shop.save()
                  .then(doc=>{
                    res.status(201).json({
                        message : "Shop is created",
                        shop : doc                  
            
                    })
                })
                  .catch(error=>{
                    res.status(500).json({
                        error : error
                    })
                   })
                    
            }
        )
        .catch(error=>{
            res.status(500).json({
                error : error
            })
        })
};

exports.shop_get_shop=(req,res,next)=>{
    Shop.findById(req.params.shopId)
    .exec()
    .then(
        doc=>{
            if(!doc){
                return res.status(200).json({
                message : "Shop not found"
                });
            }
            res.status(200).json({
                shop : doc
            })
        }
    )
    .catch(error=>{
        res.status(500).json({
            error : error
        })
    })
};


exports.shop_get_product = (req,res,next)=>{
   Shop.findById(req.params.shopId)
       .exec()
       .then(
           shop=>{
               if(!shop){
                   return res.status(200).json({
                       message : "Shop doesnt exists"
                   })
               }
            
               return Product.find({shopId : shop.id})
               .populate('shopId' , {'_id' : 1,'name' : 1})
               .select('_id name shopId category typeOfProduct price negotiable color size description date productImages views')
               .sort({date:-1})
               .exec();
            }
       )
       .then(
           products=>{
               if(products.length<1){
                   return res.status(200).json({
                       message : "Shop has no products"
                   })
               }
               res.status(200).json({
                   count : products.length,
                   products : products
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

exports.shop_update = (req,res,next)=>{
    
    if(req.file!==undefined){
       
        const opsObj = {
        "name" : req.body.name,
        "district" : req.body.district,
        "address" : req.body.address,
        "phoneNumber" : req.body.phoneNumber,
        "description" : req.body.description,
        "timings" : JSON.parse(req.body.timings),
        "shopPic" : req.file.path
        };

        Shop.findById(req.params.shopId)
        .exec()
        .then(
            shop=>{
                if(!shop){
                   return res.status(200).json({
                        message : "Shop not found"
                    })
                }
            
                if(shop.shopPic){

                    fs.unlink(shop.shopPic,(err)=>{
                        if(err){
                            return res.status(500).json({
                                error : err
                            })
                        }
                        Shop.update({_id : req.params.shopId},{$set :  opsObj})
                        .exec()
                        .then(
                            result=>{
                                res.status(200).json({
                                    message : "Shop Updated"
                                })
                            }
                        )
                        .catch(error=>{
                           res.status(500).json({
                               error : error
                           })
                       })
                    })
                }
                else{
                  Shop.update({_id : req.params.shopId},{$set : opsObj})
                  .exec()
                  .then(
                      result=>{
                          res.status(200).json({
                              message : "Shop Updated"
                          })
                      }
                  )
                  .catch(error=>{
                     res.status(500).json({
                         error : error
                     })
                 })
                }
            }
        )
        .catch(error=>{
          res.status(500).json({
              error : error
          })
      })
    }   
    else{
        const opsObj = {};
        for(const obj of req.body){
                opsObj[obj.propName] = obj.value;
            }    
            
            Shop.update({_id : req.params.shopId},{$set : opsObj})
            .exec()
            .then(
                result=>{
                    res.status(200).json({
                        message : "Shop Updated"
                    })
                }
            )
            .catch(error=>{
               res.status(500).json({
                   error : error
               })
           })
        }
};

exports.shop_delete = (req,res,next)=>{
    Shop.findById(req.params.shopId)
        .exec()
        .then(
            shop=>{
                if(!shop){
                   return res.status(200).json({
                        message : "No shop found"
                    })
                }
          
              return this.shop_remove(shop);                 
                
            }
        )
        .then(
            result=>{
                res.status(200).json({
                    message : "shop deleted"
                })
            }
        )
        .catch(error=>{
          res.status(500).json({
              error : error
          })
      })   
  };
