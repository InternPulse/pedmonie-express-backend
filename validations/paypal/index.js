const Joi = require('joi');
const validateOrder = (data)=>{
    const schema = Joi.object({
        value: Joi.number().required(),
        currency_code: Joi.string().required(),
        merchant_id: Joi.string().required()
    });

    return schema.validate(data)
}

module.exports = {validateOrder};


