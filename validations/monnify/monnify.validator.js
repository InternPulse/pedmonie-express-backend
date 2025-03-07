const joi = require("joi");

const initiatePaymentSchema = joi.object({
    currency: joi.string().uppercase().length(3).required(),
    merchant_id: joi.string().required(),
    amount: joi.number().strict().positive().required(),
    
}).options({ abortEarly: false })


const validator = (validationSchema) => (req, res, next) => {
    try {
        const result = validationSchema.validate(req.body);
        if (result.error) {
            return res.status(400).json({
                status: "error",
                message: "Validation error",
                data: result.error.details.map((error) => error.message),
            });
        }

        req.body = result.value;

        next();
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: "Validation error",
            data: error.message || error,
        });
    }
};

module.exports = { validatePaymentRequest: validator(initiatePaymentSchema) };