const { createOrder, captureOrder, getOrder, conversionsOfCurrencies }= require('../../services/paypal/index.js')
const { validateOrder } = require('../../validations/paypal/index.js')
const {sequelize} = require('../../models/index.js')

const { messages } = require('../../messages/index.js')

//This is how to import the models from the models folder

//Models
const Merchant = require('../../models/merchant.js')(sequelize, require('sequelize').DataTypes)
const Order = require('../../models/order.js')(sequelize, require('sequelize').DataTypes)
const Transaction = require('../../models/transaction.js')(sequelize, require('sequelize').DataTypes)
const Wallet = require('../../models/wallet.js')(sequelize, require('sequelize').DataTypes)


//This function is responsible for initializing the payment transaction
const createOrderController = async (req, res) => {

    try {
        const { currency_code, value, merchant_id } = req.body
        const { error } = validateOrder(req.body)

        if(error != undefined){
            return res.status(400).json({
                status: false,
                message: error.details[0].message,
            })
        }

        //This database call will be updated to find the merchant with the merchant_id
        // const MerchantData = await Merchant.findOne({
        //     where: {
        //         email: 'murewa.abass@gmail.com',
        //     }
        // })

        //An order is created in the database to keep track of the customers activity
        const order =await Order.create({
            merchant_id: merchant_id,
            gateway_name: 'PAYPAL',
            order_status: 'pending',
            amount: value,
            currency: currency_code,
        })

        if(!order){
            return res.status(404).json({
                status: false,
                message: messages.ORDER_FAILED,
            })
        }

        const orderID = order.order_id

        //This function calls the paypal API to initiate the payment
        const data = await createOrder(currency_code, value, orderID )

        if (!data){
            return res.status(404).json({
                status: false,
                message: messages.INITIALIZED_FAILED,
            })
        }

        res.status(201).json({
            status: true,
            message: messages.ORDER_INITIALIZED_SUCCESS,
            data: {order_id: order.order_id, ...data},

        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: messages.INTERNAL_SERVER_ERROR,
            error: error.message,
        })
    }
}

//This function is responsible for completing the payment transaction
const completeOrder = async (req, res) => {

    try {

        //Token is the ID of the transaction which was returned when the payment was initialized
        const { token } = req.query

        if(!token){
            res.status(403).json({
                status: false,
                message: messages.TOKEN_REQUIRED,
            })
        }

        //This function checks the database to confirm if the ID of the transaction hasn't been captured in a previous transaction
        const checkIfTokenExists = await Transaction.findOne({
            where: {
                gateway_transaction_identifier: token,
            },
        })

        if(checkIfTokenExists != null){
            return res.status(409).json({
                status: false,
                message: messages.ORDER_PREV_CAPTURED,
            })
        }

        //This function captures the payment in the paypal API
        const orderCapturedResponse = await captureOrder(token)


        //This functions gets the order captured from the paypal API
        const orders = await getOrder(token)

        if(orders.status !== 'COMPLETED'){
            return res.status(400).json({
                status: false,
                message: messages.INCOMPLETE_ORDER
            })
        }

        //Getting the ID of th database order that was stored during the initialization of the transaction
        const order_id = orders.purchase_units[0].custom_id
        
        
        //This functions checks the response from captureOrder functions for errors and returns
        if( !orderCapturedResponse.status ){

            //this updates the order database to status of failed
            await Order.update(
                {order_status: 'failed'}, {
                    where: {
                        order_id: order_id,
                    }
            
            });

            //Returning various messages depending on the response.name
            switch(orderCapturedResponse.name){
                case 'NOT_AUTHORIZED':
                    return res.status(403).json({
                        status: false,
                        message: orderCapturedResponse.message,
                    })
                case 'RESOURCE_NOT_FOUND':
                    return res.status(404).json({
                        status: false,
                        message: orderCapturedResponse.message,
                    })
                case 'UNPROCESSABLE_ENTITY':
                    return res.status(422).json({
                        status: false,
                        message: orderCapturedResponse.message,
                    })
                default:
                    return res.status(500).json({
                        status: false,
                        message: messages.INTERNAL_SERVER_ERROR,
                    })
                }
            }
        //get the amount the customer paid
        const customer_paid = orders.purchase_units[0].payments.captures[0].seller_receivable_breakdown.gross_amount.value
        
        //get the currency the customer used in paying
        const customer_paid_currency = orders.purchase_units[0].payments.captures[0].seller_receivable_breakdown.gross_amount.currency_code
        
        //get the amount the seller received from paypal
        const seller_received = orders.purchase_units[0].payments.captures[0].seller_receivable_breakdown.net_amount.value
        
        //get the currency the seller received in
        const seller_received_currency = orders.purchase_units[0].payments.captures[0].seller_receivable_breakdown.net_amount.currency_code
        
        //this function gets the Order record from the DB
        const merchant_order = await Order.findOne({
            where: {
                order_id: order_id,
            },
        })


        //this function gets the merchant's wallet
        const getWallet =await Wallet.findOne({
            where: {
                merchant_id: merchant_order.merchant_id,
            },
        })
        if(!getWallet){
            return res.status(404).json({
                status: false,
                message: messages.WALLET_NOT_FOUND,
            })
        }
        const transactionIntoWallet = await Transaction.create({
            order_id,
            merchant_id: merchant_order.merchant_id,
            gateway_name: 'PAYPAL',
            gateway_transaction_identifier: 'Payment Into Wallet',
            payment_channel: 'CARD',
            amount: customer_paid,
            currency: customer_paid_currency,
            status:'pending'
        },
    )
        //get the different conversions for various currency codes using the merchant's wallet currency as the base currency
        const convert = await conversionsOfCurrencies(getWallet.currency)

        if(convert == null){
            res.status(404).json({
                status: false,
                message: messages.ERROR_OCCURED
            })
        }

        //this converts the amount the customer paid to the wallet's currency
        const AmountSendToWallet = (seller_received/convert[seller_received_currency]).toFixed(2)
        console.log('amount', AmountSendToWallet)
        

        
        await Order.update(
            {order_status: 'successful'}, {
            where: {
                order_id: order_id,
            },
        });
        
        const transact = await Transaction.create({
            order_id,
            merchant_id: merchant_order.merchant_id,
            gateway_name: 'PAYPAL',
            gateway_transaction_identifier: token,
            payment_channel: 'CARD',
            amount: customer_paid,
            currency: customer_paid_currency,
            status:'successful'
        },
    )

        const incrementAmount = Number(getWallet.amount) + Number(AmountSendToWallet)
        
        //this updates the wallet amount in the database
        await getWallet.update({ amount: incrementAmount} )        

        await Transaction.update({status:'successful'},{
            where: {
                transaction_id: transactionIntoWallet.transaction_id
            },
        
        })
        res.status(200).json({
            status: true,
            message: messages.ORDER_CAPTURED_SUCCESS,
            data: {
                transact,
                getWallet
            }
        })

        

    } catch (error) {

        
        res.status(500).json({
            status: false,
            message: error.message,
        })
        
    }
}

const cancelOrder = async (req, res) => {

    try {
        const { token } = req.query

        if(!token){
            return res.status(403).json({
                status: false,
                message: messages.TOKEN_REQUIRED,
            })
        }

        //get the cancelled order from paypal API
        const orders = await getOrder(token)
        // console.log('cancel',orders)

        if(orders == null){
            return res.status(400).json({
                status: false,
                message: messages.ERROR_OCCURED
            })
        }

        if(orders.status === 'COMPLETED'){
            return res.status(400).json({
                status: false,
                message: messages.ORDER_ALREADY_COMPLETED,
            })
        }
        //get the order_id from of the database that was stored as a custom_id
        const order_id = orders.purchase_units[0].custom_id

        //update the status of the order in the database to failed
        await Order.update(
            {
            order_status: 'failed'
            },
            {
            where: {
                order_id: order_id,
            }
        })
        Transaction.update(
            {
            status:'failed'  
            },
            {
                where: {order_id: order_id}
            }
    )

        res.status(200).json({
            status: true,
            message: messages.ORDER_CANCELLED,
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
    cancelOrder
}