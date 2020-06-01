const mongoose = require('mongoose');
const Customer = require('../models/customer');
const bcrypt = require('bcrypt');
const productViewController = require('../controller/productViews');
const shopViewController = require('../controller/shopViews');
const shopLikedController = require('../controller/shopLiked');

exports.customer_get_all = (req,res,next)=>{

    Customer.find()
            .select('_id username mobileNumber dob district address sex')
            .exec()
            .then(
                docs=>{
                    res.status(200).json({
                        count : docs.length,
                        customers : docs
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

exports.customer_get_customer = (req,res,next)=>{
 Customer.findById(req.params.customerId)
         .select('_id username mobileNumber dob district address sex')
         .exec()
         .then(
             doc=>{
                 if(!doc){
                     return res.status(401).json({
                         message : "Customer doesnt exists"
                     })
                 }
                 res.status(200).json({
                     customer : doc
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

exports.customer_signup = (req,res,next)=>{
     Customer.findOne({username : req.body.username})
             .exec()
             .then(
                 doc=>{
                     if(doc){
                         return res.status(401).json({
                             message : 'Username already exists'
                         })
                     }

                     bcrypt.hash(req.body.password,10,(err,hash)=>{
                         if(err){
                             return res.status(500).json({
                                 error : err
                             })
                         }

                         const customer = new Customer({
                           _id : new mongoose.Types.ObjectId,
                           username : req.body.username,
                           password : hash,
                           mobileNumber : req.body.mobileNumber,
                           dob : req.body.dob,
                           district : req.body.district,
                           address : req.body.address,
                           sex : req.body.sex
                         });

                         customer.save()
                                 .then(
                                     result=>{
                                         res.status(201).json({
                                             message : "Customer created",
                                             _id : result._id,
                                             username : result.username,
                                             mobileNumber : result.mobileNumber,
                                             dob : result.dob,
                                             district : result.district,
                                             address : result.address,
                                             sex : result.sex
                                         })
                                     }
                                 )
                                 .catch(
                                    error=>{
                                        res.status(500).json({
                                            error : error
                                        })
                                    }
                                 );
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

exports.customer_login = (req,res,next)=>{
  Customer.findOne({username : req.body.username})
          .exec()
          .then(
              customer =>{
                  if(!customer){
                      return res.status(401).json({
                          message : "Auth failed"
                      })
                  }

                  bcrypt.compare(req.body.password,customer.password,(err,same)=>{
                      if(err){
                          return res.status(500).json({
                              error : err
                          });
                      }

                      if(!same){
                          return res.status(401).json({
                              message : "Auth failed"
                          })
                      }

                      res.status(200).json({
                          message : "Auth Successful",
                          _id : customer._id,
                          username : customer.username,
                          mobileNumber : customer.mobileNumber,
                          dob : customer.dob,
                          district : customer.district,
                          address : customer.address,
                          sex : customer.sex                          
                      });
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

exports.customer_update = async (req,res,next)=>{
     
    const opsObj = {};
    let updateUsername = false;
    let username = "";

    for(const obj of req.body){
        
        if(obj.propName==="username"){
            updateUsername=true;
            username = obj.value;
            opsObj[obj.propName] = obj.value;
        }
        else{
            opsObj[obj.propName] = obj.value;
        } 
    }

    if(updateUsername){
        try{
            let customer = await Customer.findOne({username : username});
            if(customer){
                return res.status(401).json({
                    message : "Username already exists"
                })
            }
        }
        catch(err){
           return res.status(500).json({
               error : err
           })
        }
   
    }

    Customer.update({_id : req.params.customerId},{$set : opsObj})
    .exec()
    .then(doc=>{
        res.status(200).json({
            message : "Customer updated",
        });
    })
    .catch(
        error=>{
            res.status(500).json({
                error : error
            })
        }
    )
    
  

};

exports.customer_delete = (req,res,next)=>{
    Customer.remove({_id : req.params.customerId})
            .exec()
            .then(
                result=>{
                    res.status(200).json({
                        message : "Customer deleted"
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

exports.customer_homepage = (req,res,next)=>{
 Promise.all([productViewController.trending_products(10,req.params.category),shopViewController.trending_shops(10),shopLikedController.shopliked_products(req.params.customerId,10,req.params.category)])
        .then(([trendingProducts,trendingShops,shopLikedProducts])=>{
            const result = {};
            
            if(trendingProducts.length<1){
                result['trendingProducts'] = "No trending products"
            }
            else{
                result['trendingProducts'] = trendingProducts
            }

            if(trendingShops.length<1){
                result['trendingShops'] = "No trending shops"
            }else{
                result['trendingShops'] = trendingShops
            }

            if(shopLikedProducts==="No shop liked"){
                result['shopLikedProducts'] = "No shop liked"
            }else{
                if(shopLikedProducts.length<1){
                    result['shopLikedProducts'] = "Shop has no products"
                }else{
                    result['shopLikedProducts'] = shopLikedProducts
                }
            }

            res.status(200).json(result);
        })
        .catch(error=>{
           res.status(500).json({
               error : error
           })
        })
};

exports.customer_reset_password = async (req,res,next)=>{
  try{
   let customer = await Customer.findById(req.body.customerId);
   if(!customer){
       return res.status(401).json({
           message : "Customer doesnt exists"
       })
   }

   let same = await bcrypt.compare(req.body.currentPassword,customer.password);
   if(same){
     let hash = await bcrypt.hash(req.body.newPassword,10);
     let password = {password : hash};
     let update = await Customer.update({_id : req.body.customerId},{$set : password});
     res.status(200).json({
         message : "Password updated"
     })
   }
   else{
       res.status(401).json({
           message : "Current password is incorrect"
       })
   }
  }
  catch(error){
      res.status(500).json({
          error : error
      })
  }
};