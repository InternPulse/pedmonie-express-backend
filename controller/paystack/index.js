
const {initializeTransaction, verifyTransaction, getTransaction }=  require("../../services/paystack/index.js")
const { validateOrder } = require('../../validations/paystack')
const {sequelize} = require('../../models/index.js')
const { conversionsOfCurrencies } = require('../../services/paypal')
const { messages } = require('../../messages/index.js')
const Order = require('../../models/order.js')(sequelize, require('sequelize').DataTypes)
const Transaction = require('../../models/transaction.js')(sequelize, require('sequelize').DataTypes)
const Wallet = require('../../models/wallet.js')(sequelize, require('sequelize').DataTypes)
const Merchant = require('../../models/merchants.js')(sequelize, require('sequelize').DataTypes)

const makePaymentRequest = async (req, res)=>{
console.log('got here')
    try {
        const { email, amount, merchant_id, currency } = req.body

        const { error } = validateOrder(req.body)

        if(error != undefined){
            return res.status(400).json({
                status: false,
                message: error.details[0].message,
            })
        }

        // //This database call will be updated to find the merchant with the merchant_id
        // const MerchantData = await Merchant.findOne({
        //     where: {
        //         merchant_id: merchant_id,
        //     }
        // })

//         const newMerchant = await Merchant.create({
//             email: 'aaaa@gmail.com',
//             currency: 'NGN',
//             first_name: 'Johna',
//             last_name: 'Smitha',
//             middle_name: 'Johna Smith',
//             business_name: 'Jo aaSmith',
//             password: 'password123',
//             phone: '08101019922',

//         })
// console.log('finished')
         //An order is created in the database to keep track of the customers activity
        const order =await Order.create({
            merchant_id: merchant_id,
            gateway_name: 'PAYSTACK',
            order_status: 'pending',
            amount: amount,
            currency: currency,
        })

        if(!order){
            return res.status(404).json({
                status: false,
                message: messages.ORDER_FAILED,
            })
        }
        const transaction =await initializeTransaction( email, amount, currency)

        await Transaction.create({
            order_id: order.order_id,
            merchant_id: merchant_id,
            gateway_name: 'PAYSTACK',
            gateway_transaction_identifier: transaction.data.reference,
            payment_channel: 'pending',
            amount: amount,
            currency: currency,
            status: 'pending'
        })

        console.log(transaction)

        if (!transaction){
            return res.status(404).json({
                status: false,
                message: messages.INITIALIZED_FAILED,
            })
        }
        //the reference needs to be saved in the databse so that the user won't use it again
        res.status(200).json({
            status: true,
            message: 'Payment request initialized',
            data: {
                reference: transaction.data.reference,
                authorization_url: transaction.data.authorization_url,
                order_id: order.order_id,
            }
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

const verifyPayment = async (req, res)=>{
    
    try {
        const { reference, order_id, merchant_id }  = req.body
        
        if(!reference || !order_id || !merchant_id){
            return res.status(400).json({
                status: false,
                message: messages.INVALID_REQUEST,
            })
        }

        const checkIfReferenceExist = await Transaction.findOne({
            where: {
                gateway_transaction_identifier: reference,
                status: 'successful'
            },
        })
        
        if(checkIfReferenceExist != null){
            return res.status(409).json({
                status: false,
                message: messages.ORDER_PREV_CAPTURED,
            })
        }

        const transaction = await verifyTransaction(reference)

        if(transaction == null || !transaction.status || transaction.transaction_status != 'success'){

            //this updates the order database to status of failed
            await Order.update(
                {order_status: 'failed'}, {
                    where: {
                        order_id: order_id,
                    }
            });

            return res.status(404).json({
                status: false,
                message: messages.VERIFY_FAILED,
            })

        }
        
        await Order.update(
            {order_status: 'successful'}, {
            where: {
                order_id: order_id,
            }
        })

        await Transaction.update({
            
            gateway_name: transaction.id,
            payment_channel: `PAYSTACK ${transaction.payment_channel}`,
            amount: transaction.amount,
            currency: transaction.currency,
            status: 'successful'
        },{
            where:{
                gateway_transaction_identifier: reference
            }
        }
    )

        const getWallet = await Wallet.create({
                merchant_id: merchant_id,
                amount: transaction.amount,
                currency: transaction.currency
        })

        const transactionIntoWallet = await Transaction.create({
            order_id,
            merchant_id: merchant_id,
            gateway_name: 'PAYSTACK',
            gateway_transaction_identifier: 'Payment Into Wallet',
            payment_channel: transaction.payment_channel,
            amount: transaction.amount,
            currency: transaction.currency,
            status:'pending'
        },
    )
        const convert = await conversionsOfCurrencies(getWallet.currency)
            console.log('got here A')

        if(convert == null){
            res.status(404).json({
                status: false,
                message: messages.ERROR_OCCURED
            })
        }

        const AmountSendToWallet = (transaction.amount/convert[transaction.currency]).toFixed(2)
            console.log('got here B')

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
            message: 'Payment verified',
            id: transaction.id,
            data: getWallet
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

async function getPaymentDetails(req, res){

    try {
        const { id } = req.params

        const transaction = await getTransaction(id)
        
        if(transaction == null){
            throw new Error('Failed to get payment details')
        }

        res.status(200).json({
            status: true,
            message: 'Payment details retrieved',
            data: transaction
        })
    } catch (error) {
        
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}


module.exports = {
    makePaymentRequest,
    verifyPayment,
    getPaymentDetails
}
