const axios = require("axios");
const { Order, Transaction, Wallet } = require("../../models");


exports.createTransaction = async (req, res) => {
  const { merchant_id } = req.params;
  const { amount, currency, customer_email } = req.body;

  // Validate the details received
  if (!amount || !currency || !customer_email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const tx_ref = `txn_${Date.now()}`; // Unique transaction reference

    // Create an order in the database with status 'pending'
    const newOrder = await Order.create({
      merchant_id,
      gateway_name: "flutterwave",
      amount,
      currency,
      order_status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Hit the payment gateway endpoint to initialize transaction
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref,
        amount,
        currency,
        redirect_url: "https://pedmonie.com/payment-success",
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

    if (response.data.status === "success") {
      // Create a transaction and link it to the order
      await Transaction.create({
        order_id: newOrder.order_id,
        merchant_id,
        gateway_name: "flutterwave",
        gateway_transaction_identifier: response.data.data.id,
        payment_channel: "card, banktransfer, ussd",
        amount,
        status: "pending",
        currency,
      });

      // Return the response from the payment gateway initialization
      return res.status(201).json({
        status: "success",
        message: "Transaction created successfully",
        data: {
          order_id: newOrder.order_id,
          tx_ref,
          amount,
          currency,
          payment_options: "card, banktransfer, ussd",
          customer: {
            email: customer_email,
          },
          redirect_url: response.data.data.link, // Flutterwave payment link
        },
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: "Transaction could not be created",
      });
    }
  } catch (error) {
    console.error("Flutterwave API error:", error.response?.data || error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      details: error.message,
    });
  }
};





exports.verifyTransaction = async (req, res) => {
  const { transaction_id } = req.params;

  try {
    // Retrieve the transaction from the database
    const transaction = await Transaction.findOne({ where: { transaction_id } });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Verify the transaction with Flutterwave
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction.gateway_transaction_identifier}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const flwResponse = response.data;

    if (flwResponse.status === "success" && flwResponse.data.status === "successful") {
      // Update transaction status to 'successful'
      await transaction.update({
        status: "successful",
        gateway_transaction_identifier: flwResponse.data.id,
      });

      // Update order status to 'successful'
      await Order.update(
        { order_status: "successful" },
        { where: { order_id: transaction.order_id } }
      );

      // Credit the merchant's wallet with the amount credited by Flutterwave
      const creditedAmount = flwResponse.data.settlement_amount;
      const wallet = await Wallet.findOne({ where: { merchant_id: transaction.merchant_id } });

      if (wallet) {
        wallet.amount = parseFloat(wallet.amount) + parseFloat(creditedAmount);
        await wallet.save();
      } else {
        // Create a wallet if none exists
        await Wallet.create({
          merchant_id: transaction.merchant_id,
          amount: creditedAmount,
          currency: transaction.currency,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Transaction verified and wallet credited",
      });
    } else {
      // Update transaction and order status to 'failed'
      await transaction.update({ status: "failed" });
      await Order.update(
        { order_status: "failed" },
        { where: { order_id: transaction.order_id } }
      );

      return res.status(400).json({
        status: "error",
        message: "Transaction verification failed",
      });
    }
  } catch (error) {
    console.error("Transaction verification error:", error.response?.data || error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      details: error.message,
    });
  }
};
