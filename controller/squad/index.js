const SQUADService = require("../../services/squad");
const ValidationSchema = require("../../validations/squad");
const hash_compare_values = require("./utils/hashValues.js")
const {sequelize} = require('../../models/index.js')

//Import merchant model
const Merchant = require('../../models/merchant.js')(sequelize, require('sequelize').DataTypes);

//Import the order model
const Order = require('../../models/order.js')(sequelize, require('sequelize').DataTypes);

//Import the transaction model
const Transaction = require('../../models/transaction.js')(sequelize, require('sequelize').DataTypes);

//Import the wallect model
const Wallect = require('../../models/wallet.js')(sequelize, require('sequelize').DataTypes);



module.exports = {
  initializePayment: async (req, res, next) => {

    const { email, amount, currency_code } = req.body;

    
    //Valida the data parsed to the request body
    const { error, value } = ValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "failed",
        message: `${error}`,
      });
    }

    const merchantEmail = value.email

    const MerchantData = await Merchant.create({
      first_name: "Daniel",
      last_name: "Ochigbo",
      middle_name: "Ojo",
      email: "ochigbodaniel240@gmail.com",
      phone: "+s454553",
      role: "merchant",
      password_hash: "ekklklkmrfr",
      password_salt: "e34rrer",
      total_balance: 40000.00,
      business_name: "ftfcftcttu tuf"
    })

    console.log(MerchantData)

     //This database call will be updated to find the merchant with the merchant_id

    
    // Send the validated request body to the service function
    // response status of initiation from the service function
    try {        
        const responseStatus = await SQUADService.initializePayment(
        merchantEmail,
        value.amount * 100, // converting to the lowest denomination
        value.currency_code
      );

      // Get the transaction referrence
      const transactionRef = responseStatus.data.transaction_ref
      // hash the transaction reference
      const hashRef = await hash_compare_values.hashValue(transactionRef)
      console.log(hashRef)

      return res.status(200).json({
        data: responseStatus
      })

    } catch (error) {
      return res.status(404).json({
        message: "An eeror occurred"
      });
    }
  },

  verifyPayment: async (req, res, next)=>{
    // get reference from the req body
    const {transactionRef} = req.body

    //Call the verification query from the service folder
    try {
        const verificationStatus = await SQUADService.verifyPayment(transactionRef)
        
        return res.status(200).json({
            data: verificationStatus
        });

    } catch (error) {
        throw new Error(error.message)
    }

    //Get the transaction status
  }
};
