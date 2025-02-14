const { createOrder, captureOrder }= require('../../services/paypal/index.js')
const { validateOrder } = require('../../validations/paypal/index.js')
const {sequelize} = require('../../models/index.js')


//This is how to import the models from the models folder
const Merchant = require('../../models/merchant.js')(sequelize, require('sequelize').DataTypes);
////////////////////////////////



const createOrderController = async (req, res) => {
    // Implement logic to create an order using the access token

    try {
        const { currency_code, value, email } = req.body
        const { error } = validateOrder(req.body)

        if(error != undefined){
            return res.status(400).json({
                status: false,
                message: error.details[0].message,
            })
        }

        const data = await createOrder(currency_code, value)
        if (!data){
            return res.status(404).json({
                status: false,
                message: 'Failed to create order',
            })
        }

        res.status(201).json({
            status: true,
            message: 'Order created successfully',
            data: data,
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

const completeOrder = async (req, res) => {

    try {
        const { token } = req.query

        if(!token){
            res.status(403).json({
                status: false,
                message: 'Token is required',
            })
        }

        await captureOrder(token)

        res.status(200).json({
            status: true,
            message: 'Order captured successfully',
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        })
    }
}



module.exports = {
    createOrderController,
    completeOrder,
}