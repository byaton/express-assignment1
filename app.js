const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();


const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');
const testRoutes = require('./api/routes/test');

// mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_USER}
//                   @amittestcluster-ynjnp.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true`,
//                   {useNewUrlParser: true});

mongoose.connect('mongodb+srv://amit:amit@amittestcluster-ynjnp.mongodb.net/test?retryWrites=true',
                  {useNewUrlParser: true, useUnifiedTopology: true});

app.use(morgan('dev'));
app.use(express.static('upload'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        Response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
        return res.status(200).json({});
    }
    next();
});

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);
app.use('/test', testRoutes);

app.use((req, res, next) => {
    const error = new Error('The specified route was not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        message: error.message
    });
    
});

module.exports = app;