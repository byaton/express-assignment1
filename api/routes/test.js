const express = require('express');
//const nameModel = require('../models/test');

const nameModel = [
    {id: 1, name: 'Amit1'}, 
    {id: 2, name: 'Amit2'}, 
    {id: 3, name: 'Amit3'}, 
    {id: 4, name: 'Amit4'}
];

const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json(nameModel);
});

router.post('/', (req, res, next) => {
    const testUserData = req.body;
    nameModel.push(testUserData);
    res.status(200).json({
        message: 'Data is Pushed successfully'
    });
});

module.exports = router;