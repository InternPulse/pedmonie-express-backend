const Joi = require("joi");

const schema = Joi.object({
  // Mimmum value is N100 = 10000K
  amount: Joi.number().min(10000).required(),
  // The only currence allowed are NGN and USD
  currency_code: Joi.string().valid("NGN", "USD").required(),
  // Email validation
  email: Joi.string().email().required(),
});

module.exports = schema;
