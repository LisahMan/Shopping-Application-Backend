const mongoose = require('mongoose');
const Product = require('../models/product');
const productViewController = require('../controller/productViews');
const productSearchesController = require('../controller/productSearches');
const fs = require('fs');

 function deleteImages(files,callback){
    let i = files.length;
    files.forEach(function(filepath){
     fs.unlink(filepath,function(err){
         i--;
         if(err){
             callback(err);
             return;
         }
         else if(i<=0){
             callback(null);
         }
     })
    })
}


exports.product_remove = (product)=>{
    return new Promise((resolve,reject)=>{
     deleteImages(product.productImages,(err)=>{
         if(err){
             reject(err);
         }else{
             product.remove((err,doc)=>{
              if(err){
                  reject(err);
              }else{
                  resolve(null);
              }
             });
         }
     })
    });
}

exports.product_get_all = (req,res,next)=>{
 
    Product.find()
           .exec()
           .then(
               docs=>{
                   res.status(200).json({
                       count : docs.length,
                       products : docs

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

exports.product_create = (req,res,next)=>{
    const product = new Product({
        _id : new mongoose.Types.ObjectId,
        shopId : req.body.shopId,
        name : req.body.name,
        category : req.body.category,
        typeOfProduct : req.body.typeOfProduct,
        price : req.body.price,
        negotiable : req.body.negotiable,
        description : req.body.description,
        color : req.body.color,
        size : req.body.size,
        productImages : req.files.map(file=>file.path),
        date : req.body.date
    });

    product.save()
           .then(
               doc=>{
                   res.status(201).json({
                       message : "Product is created",
                       product : doc
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

exports.product_get_product = (req,res,next)=>{
   Product.findById(req.params.productId)
          .populate('shopId',{'_id' : 1,'name' : 1})
          .select('_id name shopId category typeOfProduct price negotiable color size description date productImages views')
          .exec()
          .then(
              doc=>{
                  if(!doc){
                      return res.status(200).json({
                          message : "Product not found"
                      })
                  }
                  res.status(200).json({
                      product : doc
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

exports.product_update = (req,res,next)=>{
   
    if(req.files!==undefined){
        console.log("correct place");
      const opsObj = {
         'name' : req.body.name,
         'category' : req.body.category,
         'typeOfProduct' : req.body.typeOfProduct,
         'price' : req.body.price,
         'negotiable' : req.body.negotiable,
         'color' : req.body.color,
         'size' : req.body.size,
         'description' : req.body.description,
         'productImages' : req.files.map(file=>file.path)
          };
        Product.findById(req.params.productId)
        .exec()
        .then(
            product=>{
                if(!product){
                    res.status(200).json({
                        message : "Product not found"
                    })
                }

                deleteImages(product.productImages,(err)=>{
                    if(err){
                        return res.status(500).json({
                            error : err
                        })
                    }

                    Product.update({_id : req.params.productId},{$set: opsObj})
                        .exec()
                        .then(
                           result=>{
                               res.status(200).json({
                                   message : "Product Updated"
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
                });
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
   else{
    const opsObj = {};
    for(const obj of req.body){
        opsObj[obj.propName] = obj.value;
         }
        Product.update({_id : req.params.productId},{$set : opsObj})
               .exec()
               .then(
                   result=>{
                       res.status(200).json({
                           message : "Product Updated"
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
   };


exports.product_delete = (req,res,next)=>{
    Product.findById(req.params.productId)
           .exec()
           .then(
             product=>{
                 if(!product){
                     return res.status(200).json({
                         message : "Product not found"
                     })
                 }

                return this.product_remove(product); 
                }
                 )
           .then(
               result=>{
                   res.status(200).json({
                       message : "Product deleted"
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

  exports.product_filter_category = (req,res,next)=>{
      let typeOfProduct = req.body.typeOfProduct;
      let filterObj = {
          'category' : req.body.category
      };

      if(typeOfProduct!=="all"){
          filterObj['typeOfProduct'] = typeOfProduct
      }
      

      Product.find(filterObj)
             .populate('shopId',{'_id' : 1,'name' : 1})
             .select('_id name shopId category typeOfProduct price negotiable color size description date productImages views')
             .sort({'date' : '-1'})
             .exec()
             .then(
                 docs=>{
                    if(docs.length<1){
                        return res.status(200).json({
                            message : "No products found"
                        });
                    }

                    res.status(200).json({
                        products : docs
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
