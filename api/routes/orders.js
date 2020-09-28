const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.get('/', checkAuth, (req, res, next) => {
    Order.find().select('product quantity').populate('product', 'name price').exec().then(doc => {
        res.status(200).json({
            count: doc.length,
            Orders: doc.map(d => {
                return {
                    product: d.product,
                    quantity: d.quantity,
                    request: {
                        method: req.method,
                        url: req.headers.host + req.originalUrl + '/' + d._id
                    }
                }
            })
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', checkAuth, (req, res, next) => {
    Product.findById(req.body.product).then(prod => {
        const order = new Order({
            _id: new mongoose.Types.ObjectId(),
            product: prod._id,
            quantity: req.body.quantity
        }) ;
        return order.save();
    }).then(doc => {
        res.status(201).json({
            message: 'Order has been created',
            createdOrder: {
                _id: doc._id,
                product: doc.product,
                quantity: doc.quantity
            },
            request: {
                type: req.method,
                url: req.headers.host + req.originalUrl + '/' + doc._id
            }
        });        
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:orderId', checkAuth, (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId).populate('product').then(doc => {
        if (!!doc) {
            res.status(200).json(doc);
        } else {
            res.status(404).json({
                message: 'No valid entry was found for this ID'
            });
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });
});

router.delete('/:orderId', checkAuth, (req, res, next) => {
    const orderId = req.params.orderId;
    Order.deleteOne({_id: orderId}).exec().then(doc => {
        res.status(200).json({
            message: 'The Order has been deleted'
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });
});


module.exports = router;