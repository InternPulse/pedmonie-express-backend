const SQUADService = require("../../services/squad");
const ValidationSchema = require("../../validations/squad");
const hash_compare_values = require("./utils/hashValues.js")
const {sequelize} = require('../../models/index.js');
const { where } = require("sequelize");
const order = require("../../models/order.js");

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
    const initializedAmount = value.amount
    const initializedCurrency = value.currency_code

    //This database call will be updated to find the merchant with the merchant_id
    const MerchantData = await Merchant.findOne({
      where: {
          email: merchantEmail,
      }
  })

  //An order is created in the database to keep track of the customers activity
  const order =await Order.create({
    merchant_id: MerchantData.merchant_id,
    gateway_name: 'Squad',
    order_status: 'pending',
    amount: initializedAmount,
    currency: initializedCurrency,
})

if(!order){
    return res.status(404).json({
        status: false,
        message: messages.ORDER_FAILED,
    })
}

const orderID = order.order_id

    
    
    // Send the validated request body to the service function
    // response status of initiation from the service function
    try {        
        const responseStatus = await SQUADService.initializePayment(
        merchantEmail,
        initializedAmount, // converting to the lowest denomination
        initializedCurrency
      );

      return res.status(200).json({
        orrder_id: orderID,
        data: responseStatus.data
      })

    } catch (error) {
      return res.status(404).json({
        message: "An eeror occurred"
      });
    }
  },

  verifyPayment: async (req, res, next)=>{
    //A DB transaction is initiated
    const t = await sequelize.transaction();

    // get reference from the req body
    const {transactionRef, order_id} = req.body
    if(!transactionRef || !order_id){
      res.status(403).json({
          status: false,
          message: "Transaction reference and id are required is required",
      })
  }


    //Call the verification query from the service folder
    try {
        const verificationStatus = await SQUADService.verifyPayment(transactionRef)
        const transactionStatus = verificationStatus.data.transaction_status
        
        const order = await Order.findOne({
          where: {order_id:order_id}
        })

        if(order){
          order.dataValues.order_status= transactionStatus
          await order.save()
        }

        const updatedOrader = order.dataValues

        console.log(updatedOrader)

        
        // Create a new transaction record
        const newTransactionData = {
          order_id: updatedOrader.order_id,
          merchant_id: updatedOrader.merchant_id,
          gateway_name: updatedOrader.gateway_name,
          gateway_transaction_identifier: transactionRef,
          payment_channel: 'card',
          amount: updatedOrader.amount,
          status: updatedOrader.order_status === 'abandoned' ? "fail" : updatedOrader.order_status, // optional, as 'pending' is the default
          currency: updatedOrader.currency
        };

        

        return res.status(200).json({
            data: verificationStatus.data
        });

    } catch (error) {
        return res.status(500).json({
          message: "Internal server error",
          error:error
      });
    }

    //Get the transaction status
  }
};
