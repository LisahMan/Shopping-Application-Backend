const mongoose = require('mongoose');
const Bag = require('../models/bag');
const Customer = require('../models/customer');

//function to create bag
exports.bag_create = (req, res, next) => {
	const bag = new Bag({
		_id: new mongoose.Types.ObjectId(),
		customerId: req.body.customerId,
		productId: req.body.productId,
		date: req.body.date,
	});

	bag
		.save()
		.then((doc) => {
			res.status(201).json({
				message: 'product added to bag ',
				bag: doc,
			});
		})
		.catch((error) => {
			if (error.code === 11000) {
				res.status(409).json({
					message: 'Product is already in bag',
				});
			} else {
				res.status(500).json({
					error: error,
				});
			}
		});
};

exports.get_customer_bag = (req, res, next) => {
	Customer.findById(req.params.customerId)
		.exec()
		.then((customer) => {
			if (!customer) {
				return res.status(200).json({
					message: 'Customer doesnt exists',
				});
			}

			return Bag.find({ customerId: customer._id })
				.select('_id productId shopId')
				.populate({
					path: 'productId',
					select:
						'_id name shopId category typeOfProduct price negotiable color size description date productImages views',
					populate: {
						path: 'shopId',
						select: '_id name',
					},
				})
				.sort({ date: -1 })
				.exec();
		})
		.then((docs) => {
			if (docs.length < 1) {
				return res.status(200).json({
					message: 'No products on bag',
				});
			}
			res.status(200).json({
				count: docs.length,
				bag: docs,
			});
		})
		.catch((error) => {
			res.status(500).json({
				error: error,
			});
		});
};

exports.bag_delete = (req, res, next) => {
	Bag.remove({ _id: req.params.bagId })
		.exec()
		.then((result) => {
			res.status(200).json({
				message: 'Product removed from bag',
			});
		})
		.catch((error) => {
			res.status(500).json({
				error: error,
			});
		});
};

exports.bag_shop = (req, res, next) => {
	let pipeline = [
		{
			$group: {
				_id: '$productId',
				count: { $sum: 1 },
			},
		},
		{
			$lookup: {
				from: 'products',
				let: { productId: '$_id' },
				pipeline: [
					{
						$match: {
							$expr: { $eq: ['$_id', '$$productId'] },
							shopId: mongoose.Types.ObjectId(req.params.shopId),
						},
					},
					{
						$project: {
							_id: 1,
							name: 1,
							shopId: 1,
							category: 1,
							typeOfProduct: 1,
							price: 1,
							negotiable: 1,
							color: 1,
							size: 1,
							description: 1,
							date: 1,
							productImages: 1,
							views: 1,
						},
					},
					{
						$lookup: {
							from: 'shops',
							let: { shopId: '$shopId' },
							pipeline: [
								{ $match: { $expr: { $eq: ['$_id', '$$shopId'] } } },
								{ $project: { _id: 1, name: 1 } },
							],
							as: 'shop',
						},
					},
					{ $unwind: '$shop' },
				],
				as: 'product',
			},
		},

		{ $unwind: '$product' },
	];


	Bag.aggregate(pipeline)
		.sort({ count: -1 })
		.exec()
		.then((docs) => {
			if (docs.length < 1) {
				return res.status(200).json({
					message: 'No bagged products',
				});
			}
			res.status(200).json({
				baggedProducts: docs,
			});
		})
		.catch((error) => {
			res.status(500).json({
				error: error,
			});
		});
 
        exports.errorFunction = {
            try{

            
        };

};
