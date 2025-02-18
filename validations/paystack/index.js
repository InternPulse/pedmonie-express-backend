const Joi = require('joi');
const validateOrder = (data)=>{
    const schema = Joi.object({
        email: Joi.string().required(),
        amount: Joi.string().required(),
        merchant_id: Joi.string().required(),
        currency: Joi.string().required(),
    });

    return schema.validate(data)
}

module.exports = {validateOrder};



