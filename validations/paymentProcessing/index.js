const Joi = require('joi');
const validatePaymentGateway = (data)=>{
    const schema = Joi.object({
        gateway_name: Joi.string().required(),
        gateway_logo: Joi.string().required()
    });

    return schema.validate(data)
}

const validatePaymentGatewayUpdate = (data)=>{
    const schema = Joi.object({
        gateway_name: Joi.string(),
        gateway_logo: Joi.string()
    });

    return schema.validate(data)
}

const validateMerchantPaymentGateway = (data)=>{
    const schema = Joi.object({
    
        payment_gateways: Joi.string().required(),
    })

        return schema.validate(data)

}

const validateUpdateMerchantPaymentGateway = (data)=>{
    const schema = Joi.object({
    
        payment_gateways: Joi.string(),
    })

        return schema.validate(data)

}

module.exports = {validatePaymentGateway, validatePaymentGatewayUpdate, validateMerchantPaymentGateway, validateUpdateMerchantPaymentGateway};


