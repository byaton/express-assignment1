const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

router.post('/signup', (req, res, next) => {
    console.log('I am here at 1');
    User.find({email: req.body.email}).then(dUser => {
        if (dUser.length > 0) {
            res.status(409).json({
                error: 'User with same Email already exists'
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                console.log('I am here at 2');
                if (!!err) {
                    console.log('I am here at hash error', err);
                    res.status(500).json({
                        errorMessage: err
                    });
                } else {
                    console.log('I am here at 3');
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
        
                    user.save().then(doc => {
                        console.log('I am here at 4');
                        res.status(201).json({
                            createdUser: req.body.email,
                            message: 'User got created'
                        });
                    }).catch(err => {
                        console.log('I am here at 5');
                        res.status(401).json({
                            error: err,
                            message: 'User could not be created'
                        });
                    });
                }
            });                    
        }
    });
});

router.post('/signin', (req, res, next) => {
    console.log('I am in Sign in at step 1');
    
    const userId = req.body.email;
    const password = req.body.password;

    User.find({email: userId}).then(dUser => {
        console.log('I am in Sign in at step 2');
        console.log(dUser);
        console.log(userId);
        console.log(password);
        if (dUser.length > 0) {
            bcrypt.compare(password, dUser[0].password, (err, same) => {
                if (!!err) {
                    res.status(402).json({
                        error: err
                    });
                } else {
                    if (same) {
                        const token = jwt.sign({
                            email: dUser[0].email,
                            userId: dUser[0]._id
                        }, 
                        'amit$#*(Rg!roy', 
                        {
                            expiresIn: '1h'
                        });
                        res.status(200).json({
                            message: 'Login successful',
                            token: token
                        });
                    } else {
                        res.status(402).json({
                            message: 'Password does not match'
                        });
                    }
                }
            })
        } else {
            res.status(401).json({
                message: 'The User could not be found'
            });
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });



});

router.delete('/:userId', (req, res, next) => {
    const userId = req.params.userId;
    User.find({email: userId}).then(dUser => {
        if (dUser.length > 0) {
            User.deleteOne({email: userId}).then(doc => {
                res.status(200).json({
                    message: 'The user got deleted successfully',
                    email: userId
                });
            }).catch(err => {
                res.status(500).json({
                    error: err
                });
            });        
        } else {
            res.status(401).json({
                message: 'The user was not found'
            });
        }
    });

});

module.exports = router;