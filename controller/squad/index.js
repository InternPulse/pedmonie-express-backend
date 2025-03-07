const SQUADService = require("../../services/squad");
const ValidationSchema = require("../../validations/squad");
const {sequelize} = require('../../models/index.js');
const { where } = require("sequelize");
const order = require("../../models/order.js");
const { default: axios } = require("axios");


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

    // retrieve the merchant id
    const record = await Merchant.findOne({
      where: { email }
    })
    if (!record){
      return res.status(404).json({
        message: `No Merchant record with ${email}`
      })
    }
    //Store the merchant id
    const merchant_id = record.merchant_id;

  //An order is created in the database to keep track of the customers activity
    const order = await Order.create({
      merchant_id: merchant_id,
      gateway_name: 'Squad',
      order_status: 'pending',
      amount: initializedAmount,
      currency: initializedCurrency,
    })

    if(!order){
        return res.status(505).json({
            status: false,
            message: "Something went wrong",
        })
    }
    
    // Store the newly created order
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
        order_id: orderID,
        data: responseStatus.data
      })

    } catch (error) {
      return res.status(404).json({
        message: "An error occurred",
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


  // check if the payment reference already exist as a successful transaction
  const existingTransaction = await Transaction.findOne(
    {
      where: {
      gateway_transaction_identifier: transactionRef,
      status: 'successful'
    },
  })
  if (existingTransaction){
    return res.status(401).json({
      status: false,
      message: "Trasaction already conculded"
        })
  }


    //Call the verification query from the service folder
    try {
        const verificationStatus = await SQUADService.verifyPayment(transactionRef)
        const transactionStatus = verificationStatus.data.transaction_status
        const transactionChannel = verificationStatus.data

        let status;
        // Checking and aligning the squad transaction status to that of the transaction model
        if (transactionStatus === 'abandoned' || transactionStatus === 'failed'){
          status = "failed"
        }else if(transactionStatus === 'pending'){
          status = "pending"
        }else {
          status = "successfull"
        }

          
        const order = await Order.findOne({
          where: {order_id:order_id}
        })

        if(!order){
          return res.status(404).json({
            message: `Could not find order with id ${order_id}`
          })
        }


        if(!verificationStatus){
          return res.status(404).json({
            message: "Something went wrong"
          })
        }

        if(order){
          order.dataValues.order_status= transactionStatus
          await order.save()
        }

        


        const updatedOrader = order.dataValues
        
        // Create a new transaction record
        const newTransactionData = await Transaction.create(
          {
          order_id: updatedOrader.order_id,
          merchant_id: updatedOrader.merchant_id,
          gateway_name: updatedOrader.gateway_name,
          gateway_transaction_identifier: transactionRef,
          payment_channel: verificationStatus.data.transaction_type,
          amount: transactionChannel.merchant_amount,
          status: status, // optional, as 'pending' is the default
          currency: updatedOrader.currency
        });
        console.log(newTransactionData)

        const transaction_status = newTransactionData.status;
        
        if(transaction_status === 'successful'){
          // Sort for wallect by merchant id
          let  wallet = await Wallect.findOne({
            where: {merchant_id:newTransactionData.merchant_id}
          })
          if (!wallet){
            return res.status(404).json({
              message: "Wallect not found"
            })

          }
          //Update the wallet ballance
          const availableAmount = wallet.amount
          const addBalance = Number(availableAmount) + Number(newTransactionData.amount)
          wallet.amount = addBalance;
          await wallet.save()

          return res.status(200).json({
            message: "Payment successful and wallect updated",
            data: wallet
        });
        }
        return res.status(400).json({
          message: `Transaction ${newTransactionData.status}`,
          data: newTransactionData
        })


    } catch (error) {
      
        return res.status(500).json({
          message: "Internal server error",
      });
    }

    //Get the transaction status
  }
};
