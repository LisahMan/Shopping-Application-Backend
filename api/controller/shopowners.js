const mongoose = require('mongoose');
const Shopowner = require('../models/shopowner');
const bcrypt = require('bcrypt');
const Shop = require('../models/shop');
const shopController = require('../controller/shops');
const fs = require('fs');

exports.shopowner_remove = (shopowner)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            const shop = await Shop.findOne({shopownerId : shopowner._id});
        
            if(shop){
                    await shopController.shop_remove(shop);
            }
        
            shopowner.remove((err,doc)=>{
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

exports.shopowner_get_all = (req,res,next)=>{
    Shopowner.find()
             .select('_id username mobileNumber')
             .exec()
             .then(
                 docs=>{
                     res.status(200).json({
                        count  : docs.length,
                        shopowners : docs         
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

exports.shopowner_get_shopowner = (req,res,next)=>{
    Shopowner.findById(req.params.shopownerId)
             .select('_id username mobileNumber')
             .exec()
             .then(
                 doc=>{
                     res.status(200).json({
                         shopowner : doc
                     })
                 }
             )
             .catch(
                 error =>{
                     res.status(500).json({
                         error : error
                     })
                 }
             )
};

exports.shopowner_signup = (req,res,next)=>{
   Shopowner.findOne({username : req.body.username})
            .exec()
            .then(
                doc=>{
                    if(doc){
                        return res.status(409).json({
                            message : "Username already exists"
                        });
                    }

                    bcrypt.hash(req.body.password,10,(err,hash)=>{
                        if(err){
                            return res.status(500).json({
                                error : err
                            });
                        }

                        const shopowner = new Shopowner({
                            _id : new mongoose.Types.ObjectId,
                            username : req.body.username,
                            password : hash,
                            mobileNumber : req.body.mobileNumber
                        });

                        shopowner.save()
                        .then(
                            result=>{
                                console.log(result);
                                res.status(201).json({
                                    message : "Shopowner created",
                                    _id : result._id,
                                    username : result.username,
                                    mobileNumber : result.mobileNumber
                                })
                            }
                        )
                        .catch(
                            error =>{
                                res.status(500).json({
                                    error : error
                                })
                            }
                        );
                        
                    })
                }
            )
            .catch(
                error =>{
                    res.status(500).json({
                        error : error
                    })
                }
            )
};

exports.shopwoner_login = (req,res,next)=>{
    Shopowner.findOne({username : req.body.username})
             .exec()
             .then(
                 shopowner=>{
                     if(!shopowner){
                         return res.status(401).json({
                             message : "Auth failed"
                         })
                     }
                     bcrypt.compare(req.body.password,shopowner.password,(err,same)=>{
                        if(err){
                               return  res.status(500).json({
                                   error : err
                               });
                       }

                       if(!same){
                          return res.status(401).json({
                               message : "Auth failed"
                           })
                       }
                       
                       Shop.findOne({shopownerId : shopowner._id})
                           .exec()
                           .then(
                               shop=>{
                                   
                                   res.status(200).json({
                                    message : "Auth succesful",
                                    _id : shopowner._id,
                                    username : shopowner.username,
                                    mobileNumber : shopowner.mobileNumber,
                                    shop : shop
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
             )
             .catch(
                error =>{
                    res.status(500).json({
                        error : error
                    })
                }
             ) 
};

exports.shopowner_update = async (req,res,next)=>{
    const opsObj = {};
    let updateUsername = false;
    let username = "";
    for(const ops of req.body){
         if(ops.propName==='username'){
            updateUsername=true;
            username = ops.value;
            opsObj[ops.propName] = ops.value;    
        }else{
            opsObj[ops.propName] = ops.value;
        }
    }


    if(updateUsername){
       try{
        let shopowner = await Shopowner.findOne({username : username });
        if(shopowner){
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
    

    Shopowner.update({_id : req.params.shopownerId},{$set : opsObj})
    .exec()
    .then(
          doc=>{
              res.status(200).json({
                  message : "Shopowner updated",
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
    

    
};

exports.shopowner_delete = (req,res,next)=>{

    Shopowner.findById(req.params.shopownerId)
             .exec()
             .then(
                 shopowner=>{
                     if(!shopowner){
                         return res.status(200).json({
                             message : "Shopowner not found"
                         })
                     }

                     return this.shopowner_remove(shopowner);
                }
             )
             .then(
                 result=>{
                     res.status(200).json({
                         message : "shopowner deleted"
                     })
                 }
             )
             .catch(error=>{
                 res.status(500).json({
                 error : error
                 });
             })

};

exports.shopowner_reset_password = async (req,res,next)=>{
 try{
  let shopowner = await Shopowner.findById(req.body.shopownerId);
  if(!shopowner){
      return res.status(401).json({
          message : "Shopowner doesnt exists"
      });
  }
  let same = await bcrypt.compare(req.body.currentPassword,shopowner.password);
  if(same){
    let hash = await bcrypt.hash(req.body.newPassword,10);
    let password = {password : hash};
    let update = await Shopowner.update({_id : req.body.shopownerId},{$set : password});
    res.status(200).json({
        message : "Password updated"
    });
  }
  else{
      res.status(401).json({
          message : "Current password is incorrect"
      });
  }
 }
 catch(error){
     res.status(500).json({
         error : error
     })
 }
};
