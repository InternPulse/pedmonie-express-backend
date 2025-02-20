const {sequelize} = require('../../models/index.js')

const PaymentGateway = require('../../models/paymentgateways.js')(sequelize, require('sequelize').DataTypes)
const MerchantPaymentGateway = require('../../models/merchantpaymentgateway.js')(sequelize, require('sequelize').DataTypes)
const { messages } = require('../../messages/index.js')
const { validatePaymentGateway, validatePaymentGatewayUpdate, validateMerchantPaymentGateway, validateUpdateMerchantPaymentGateway } = require('../../validations/paymentProcessing/index.js')


async function getPaymentGateways(req, res){
    
    try {
        const response = await PaymentGateway.findAll()

        if(response.length < 1){
        return res.status(404).json({
            status: false,
            message: messages.PAYMENT_GATEWAY_NOT_FOUND
            })
        }

        res.status(200).json({
            status: true,
            message: messages.PAYMENT_GATEWAY_RETRIEVED,
            data: response
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

async function createPaymentGateway(req, res) {
    try {
        const { gateway_name, gateway_logo } = req.body;

        // Validate request body
        const { error } = validatePaymentGateway(req.body);
        if (error !== undefined) {
            return res.status(400).json({
                status: false,
                message: 'something went wrong'
            });
        }

        // Check if gateway already exists
        const existingGateway = await PaymentGateway.findOne({
            where: { gateway_name },
        });

        if (existingGateway) {
            return res.status(409).json({
                status: false,
                message: messages.GATEWAY_EXIST,
            });
        }

        // Create new payment gateway
        const paymentGateway = await PaymentGateway.create({
            gateway_name,
            gateway_logo,
        });

        if (!paymentGateway) {
            return res.status(500).json({
                status: false,
                message: messages.PAYMENT_GATEWAY_NOT_CREATED,
            });
        }

        // Return success response
        return res.status(201).json({
            status: true,
            message: messages.PAYMENT_GATEWAY_CREATED,
            data: paymentGateway,
        });
    } catch (error) {
        console.error('Error in createPaymentGateway:', error);
        return res.status(500).json({
            status: false,
            message: error.message || 'Internal server error',
        });
    }
}

async function updatePaymentGateway(req, res){
    try {
        const { gateway_id } = req.params

        if(Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: false,
                message: messages.NO_DATA_UPDATED
            })
        }

        const paymentGateway = await PaymentGateway.findByPk(gateway_id)

        if(!paymentGateway){
            return res.status(404).json({
                status: false,
                message: messages.PAYMENT_GATEWAY_NOT_FOUND
            })
        }

        const { error } = validatePaymentGatewayUpdate(req.body)

        if(error!= undefined){
            return res.status(400).json({
                status: false,
                message: error.details[0].message
            })
        }

        await paymentGateway.update(req.body)

        res.status(200).json({
            status: true,
            message: messages.PAYMENT_GATEWAY_UPDATED,
            data: paymentGateway
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

async function getMerchantPaymentGateways (req, res) {

    try {
        const { merchant_id } = req.params

        const response = await MerchantPaymentGateway.findOne({
            where: { merchant_id }
        })

        if(!response){
            return res.status(404).json({
                status: false,
                message: messages.PAYMENT_GATEWAY_NOT_FOUND
            })
        }

        res.status(200).json({
            status: true,
            message: messages.PAYMENT_GATEWAY_RETRIEVED,
            data: response
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

async function createMerchantPaymentGateway (req, res) {
    try {
        
        const { payment_gateways } = req.body
        const { merchant_id } = req.params

        const { error } = validateMerchantPaymentGateway(req.body);
        if (error) {
            return res.status(400).json({
                status: false,
                message: error.details[0].message,
            });
        }

        // Create new payment gateway
        const merchantPaymentGateway = await MerchantPaymentGateway.create({
            merchant_id,
            payment_gateways
        })

        if (!merchantPaymentGateway) {
            return res.status(500).json({
                status: false,
                message: messages.PAYMENT_GATEWAY_NOT_CREATED,
            });
        }

        // Return success response
        return res.status(201).json({
            status: true,
            message: messages.PAYMENT_GATEWAY_CREATED,
            data: merchantPaymentGateway,
        });
    } catch (error) {

        res.status(500).json({
            status: false,
            message: error.message || 'Internal server error',
        })

    }
}

async function updateMerchantPaymentGateway(req, res){
    try {
        const { merchant_id } = req.params

        if(!req.body.payment_gateways){
            return res.status(400).json({
                status: false,
                message: messages.INVALID_REQUEST
            })
        }
        
        const merchantPaymentGateway = await MerchantPaymentGateway.findOne({
            where: { merchant_id }
        })


        if(!merchantPaymentGateway){
            return res.status(404).json({
                status: false,
                message: messages.PAYMENT_GATEWAY_NOT_FOUND
            })
        }

        const { error } = validateUpdateMerchantPaymentGateway(req.body)
        if(error!= undefined){
            return res.status(400).json({
                status: false,
                message: error.details[0].message
            })
        }
        await merchantPaymentGateway.update(req.body)

        res.status(200).json({
            status: true,
            message: messages.PAYMENT_GATEWAY_UPDATED,
            data: merchantPaymentGateway
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

module.exports = {
    getPaymentGateways,
    createPaymentGateway,
    updatePaymentGateway,
    getMerchantPaymentGateways,
    createMerchantPaymentGateway,
    updateMerchantPaymentGateway,
}






