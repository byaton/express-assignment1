const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authKey = req.headers.authorization.split(' ')[1];
        console.log(authKey);
        const decoded = jwt.verify(authKey, 'amit$#*(Rg!roy');
        console.log(decoded);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message1: 'Authentication Failed',
            message2: error
        });
    }
    
    

};