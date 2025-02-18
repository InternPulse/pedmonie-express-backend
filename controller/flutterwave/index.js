const axios = require("axios");
const { Order, Transaction, Wallet } = require("../../models");
const { v4: uuidv4 } = require('uuid');
const orderId = uuidv4();

//Create an order once the user chooses the payment gateway with a pending status
exports.createOrder = async (req, res) => {
  const { merchant_id } = req.params;
  const { amount, currency, customer_email } = req.body;

  // Validate the request body
  if (!amount || !currency || !customer_email) {
      return res.status(400).json({status: false, error: "Missing required fields" });
  }

  try {
      // Create order with status 'pending'
      const newOrder = await Order.create({
          merchant_id,
          gateway_name: "flutterwave",
          amount,
          currency,
          order_status: "pending"
      });

      // Use the order_id (UUID) as the tx_ref
      const tx_ref = newOrder.order_id;

      // Initialize payment with Flutterwave
      const response = await axios.post(
          "https://api.flutterwave.com/v3/payments",
          {
              tx_ref,
              amount,
              currency,
              redirect_url: `${process.env.BASE_URL}callback`, 
              payment_options: "card, banktransfer, ussd",
              customer: {
                  email: customer_email,
              },
          },
          {
              headers: {
                  Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                  "Content-Type": "application/json",
              },
          }
      );

      if (response.data.status === "success" && response.data.data) {
          const transactionLink = response.data.data.link;
          return res.status(201).json({
              status: true,
              message: "Order created successfully",
              data: {
                  order_id: newOrder.order_id,
                  tx_ref,
                  redirect_url: transactionLink,
              },
          });
      } else {
          return res.status(400).json({
              status: false,
              message: "Transaction could not be initialized",
              details: response.data.message || "Unknown error",
          });
      }
  } catch (error) {
      console.error("Flutterwave API error:", error.message);
      return res.status(500).json({
          status: false,
          message: "Internal Server Error",
          details: error.message,
      });
  }
}


exports.flutterwaveCallback = async (req, res) => {
  const { status, tx_ref, transaction_id } = req.query;

  // Check if required parameters are present
  if (!transaction_id || !tx_ref) {
    return res.status(400).json({status:false, error: "Missing transaction details" });
  }

  const existingTransaction = await Transaction.findOne({
        where: { gateway_transaction_identifier: transaction_id },
        attributes: ['transaction_id'] // Only fetch what's needed
      });

      if(existingTransaction != null) {
        return res.status(409).json({
          status: false,
          message: "Transaction has already been processed",
        });

      }
  try {
    // Verify the transaction with Flutterwave
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const flwResponse = response.data;
    
    // Log the full Flutterwave response to inspect the structure
    console.log("Flutterwave Response:", JSON.stringify(flwResponse, null, 2));

    // Check if the verification was successful
    if (flwResponse.status === "success") {
      const transactionData = flwResponse.data;
      const transactionStatus = transactionData.status;
      const order_id = transactionData.tx_ref;

      // Fetch merchant_id from the Order table with specific attributes
      const order = await Order.findOne({ 
        where: { order_id },
        attributes: ['order_id', 'merchant_id'] // Explicitly select required fields
      });

      if (!order) {
        return res.status(404).json({
          status: false,
          message: "Order not found",
        });
      }

      const merchant_id = order.merchant_id;

      // Check if transaction already exists to avoid duplicates
      

      
        // Create a new transaction record
        await Transaction.create({
          order_id,
          merchant_id,
          gateway_name: "flutterwave",
          gateway_transaction_identifier: transaction_id,
          payment_channel: transactionData.payment_type,
          amount: transactionData.amount,
          status: transactionStatus,
          currency: transactionData.currency,
        });
      

      // Update order status
      await Order.update(
        {
          order_status:
            transactionStatus === "successful" ? "successful" : "failed",
        },
        { where: { order_id } }
      );

      // Credit merchant's wallet if payment was successful
      if (transactionStatus === "successful") {
        // Safely access settlement amount with optional chaining
        let settlementAmount = transactionData.settlement_amount;
        
        // If settlementAmount is undefined, try other possible fields
        if (!settlementAmount) {
          settlementAmount = transactionData.amount_settled;
        }

        if (!settlementAmount) {
          console.error("Settlement amount not found in transaction data");
          return res.status(400).json({
            status: false,
            message: "Settlement amount not available",
          });
        }

        // Strip currency symbol and convert to float
        const creditedAmount = parseFloat(
          settlementAmount.toString().replace(/[^\d.]/g, "")
        );

        // Validate credited amount
        if (isNaN(creditedAmount) || creditedAmount <= 0) {
          console.error("Invalid credited amount:", creditedAmount);
          return res.status(400).json({
            status: false,
            message: "Invalid credited amount",
          });
        }

        // Find wallet with explicit attributes
        const wallet = await Wallet.findOne({ 
          where: { merchant_id },
          attributes: ['merchant_id', 'amount'] // Only select what's needed
        });

        if (wallet) {
          await Wallet.update(
            { amount: parseFloat(wallet.amount) + creditedAmount },
            { where: { merchant_id } }
          );
        } else {
          await Wallet.create({
            merchant_id,
            amount: creditedAmount,
            currency: transactionData.currency,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      return res.status(200).json({
        status: true,
        message: "Transaction verified and processed",
      });
    } else {
      return res.status(400).json({
        status: false,
        message: "Transaction verification failed",
        details: flwResponse.message || "Unknown error",
      });
    }
  } catch (error) {
    console.error("Transaction verification error:", error.message);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
}
