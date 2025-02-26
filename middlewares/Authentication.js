const jwt = require('jsonwebtoken');
const {sequelize} = require('../models/index.js')
const Merchant = require('../models/merchants.js')(sequelize, require('sequelize').DataTypes)
const { messages } = require('../messages/index.js')


async function authentication (req, res, next) {

    try {
        const authHeader = req.headers.authorization
        
        if(!authHeader){
            return res.status(401).json({
                status: false,
                message: messages.LOGIN_REQUIRED,
            })
        }
        const token = authHeader.split(' ')[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const user = await Merchant.findOne({where: {email: decoded.email}})
        if(!user){
            return res.status(404).json({
                status: false,
                message: messages.USER_NOT_FOUND,
            })
        }

        req.user = user

        next()

        
    } catch (error) {

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                status: 'false!!!',
                message: messages.INVALID_TOKEN
            })


    } 
    else if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                status: false,
                message: messages.EXPIRED_TOKEN,
            });
    }



        res.status(500).json({
            status: false,
            message: error.message,
        })
    }
}

module.exports = authentication;