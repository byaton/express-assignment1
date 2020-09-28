const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/product');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './upload');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});

const fileType = (req, file, cb) => {    
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {  // 
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileType
});

const router = express.Router();

router.get('/', (req, res, next) => {
    Product.find().select('name price productImage').exec().then(doc => {
        const response = {
            count: doc.length,
            products: doc.map(d => {
                return {
                    name: d.name,
                    price: d.price,
                    productImage: d.productImage,
                    request: {
                        type: req.method,
                        url: req.headers.host + req.originalUrl + '/' + d._id
                    }
                }
            })
        };
        res.status(200).json(response);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message: err.message
        });
    });
});

router.post('/', upload.single('productImage'), checkAuth, (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.filename
    });
    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created Product successfully',
            createdProduct: {
                _id: result._id,
                name: result.name,
                price: result.price,
                request: {
                    type: req.method,
                    url: req.headers.host + req.baseUrl + '/' + result._id
                }
            }
        });
    
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });

});

router.get('/:productId', (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId).exec().then(doc => {
        console.log(doc);
        if (!!doc) {
            res.status(200).json(doc);
        } else {
            res.status(404).json({
                message: 'No valid entry provided for the given Product ID'
            });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.patch('/:productId', checkAuth, (req, res, next) => {
    const updatedOps = {};
    Object.keys(req.body).forEach(prop => {
        updatedOps[prop] = req.body[prop];
    })
    
    Product.updateOne({_id: req.params.productId}, updatedOps).then(doc => {
        res.status(200).json({
            message: 'The record has been updated',
            updatedProductDetails: doc,
            updatedProductName: req.body.name,
            updatedProductPrice: req.body.price
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    })
});

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    console.log(id)
    Product.deleteOne({_id: id}).then(doc => {
        res.status(200).json(doc);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});


module.exports = router;