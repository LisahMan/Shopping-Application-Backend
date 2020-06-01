const mongoose = require('mongoose');
const ShopView = require('../models/shopView');
const Shop = require('../models/shop');
const shoplikedController = require('../controller/shopLiked');
const productViewController = require('../controller/productViews');

exports.shopview_create = async (req,res,next)=>{
 try{
  const customerId = req.body.customerId;
  const shopId = req.body.shopId;
  const date = req.body.date;
  const category = req.body.sex;

  const shopView = await ShopView.findOne({customerId : customerId,shopId : shopId,date : date});

  if(!shopView){

    const shopView = new ShopView({
      _id : new mongoose.Types.ObjectId,
      customerId : customerId,
      shopId : shopId,
      date : date
    });

   await shopView.save();
   await Shop.update({_id : shopId},{$inc : {views : 1}}).exec(); 
  }

  let [shop,shopliked,trendingProducts] = await Promise.all([Shop.findById(shopId),shoplikedController.check_shopliked(customerId,shopId),productViewController.trending_products(20,category,shopId)]);
  
  if(trendingProducts.length<1){
    trendingProducts = "No trending products";
  }

  res.status(200).json({
    shop,
    shopliked,
    trendingProducts
  })
  }
 catch(error){
   res.status(500).json({
     error : error
   })
 }
};


exports.trending_shops = (limit=0)=>{
  return new Promise((resolve,reject)=>{
    let pipeline = [
      {$match : {
        date : {
          $gte : new Date(new Date - 7*60*60*24*1000)
        }
      }},
      {$group: {
        _id : "$shopId",
        count : {$sum : 1}
      }},
      {$lookup: {
        from : "shops",
        let : {"shopId" : "$_id"},
        pipeline : [
          {$match : {$expr : {$eq : ["$_id","$$shopId"]}}}
        ],
        as: "shop"
      }},
      {$unwind : "$shop"}
    ];

    if(limit!==0){
      pipeline.push({$limit : limit});
    }
    
    ShopView.aggregate(pipeline)
            .sort({count : -1})
            .exec()
            .then(docs=>{
              resolve(docs);
            })
            .catch(error=>{
              reject(error);
            })
     
  })
}

exports.shopview_trending_shops = (req,res,next)=>{
  this.trending_shops()
      .then(docs=>{
        if(docs.length<1){
          return res.status(200).json({
            message : "No trending shops"
          })
        }

        res.status(200).json({
          trendingShops : docs
        })
      })
      .catch(error=>{
        res.status(500).json({
          error :error
        })
      })
};