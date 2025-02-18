
const Joi = require('joi');

const validateOrder = (order) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        amount: Joi.number().positive().required(),
        currency: Joi.string().length(3).required(),
        merchantId: Joi.string().required()
    });

    return schema.validate(order);
};

module.exports = { validateOrder };