const { sequelize } = require("../../models/index.js")

const Order = require("../../models/order.js")(sequelize, require("sequelize").DataTypes)
const Transaction = require("../../models/transaction.js")(sequelize, require("sequelize").DataTypes)
const Wallet = require("../../models/wallet.js")(sequelize, require("sequelize").DataTypes)
// const Merchant = require("../../models/merchants.js")(sequelize, require("sequelize").DataTypes)

// Helper function to handle transactions and order retrieval
const getOrderForTransaction = async (order_id, t) => {
  const order = await Order.findOne({ where: { order_id } }, { transaction: t })
  if (!order) {
    return { status: 404, message: "Order not found" }
  }
    return order
}
const createUnpaidOrder = async (orderData) => {
  const t = await sequelize.transaction()
  try {
    const order = await Order.create(
      {
        merchant_id: orderData.merchant_id,
        gateway_name: "Stripe",
        amount: orderData.amount,
        currency: orderData.currency,
        order_status: "pending",
      },
      { transaction: t }
    )
    await t.commit()
    return { status: 201, message: "Order status created successfully", order }
  } catch (error) {
    await t.rollback()
    return { status: 500, message: "Error creating order status: " + error.message  }
  }    
}
// Update order in the database
const updateOrderStatus = async (order_id, payment_status, { transaction: t }) => {
  try {
      const order = await Order.update(
        { payment_status }, // Update the payment_status
        { where: { order_id }, transaction: t } // Find the order by order_id
      )
    return { status: 200, message: "Order status updated successfully", order }
  } catch (error) {
      return { status: 500, message: "Error updating order status: " + error.message }
  }
}
const createTransaction = async (transactionData, { transaction: t }) => {
  try {
     const order = await getOrderForTransaction(transactionData.order_id, t)
      const transaction = await Transaction.create(
        {
          order_id: order.order_id,
          merchant_id: order.merchant_id,
          gateway_name: "Stripe",
          gateway_transaction_identifier: transactionData.gateway_transaction_identifier,
          amount: transactionData.convertedAmount,
          payment_channel: "card",
          status: "successful",
          currency: "NGN",
        },
        { transaction: t }
      )
    return { status: 201, message: "Transaction created successfully", transaction }
  } catch (error) {
    return { status: 500, message: "Error creating transaction: " + error.message }
  }
 
}
const creditWallet = async (walletData, { transaction: t }) => {
  try {
    const order = await getOrderForTransaction( walletData.order_id, t)
    // Check if wallet exists
    let wallet = await Wallet.findOne({
      where: { merchant_id: order.merchant_id },
      transaction: t,
    })
    if (wallet) {
      // If wallet exists, update balance
      await wallet.update(
        { amount: Number(wallet.convertedAmount) + Number(order.convertedAmount) },
        { transaction: t }
      )
    } else {
      // If wallet doesn't exist, create new one
      wallet = await Wallet.create(
        {
          merchant_id: order.merchant_id,
          amount: order.convertedAmount,
          currency: "NGN",
        },
        { transaction: t }
      )
    }

    return { status: 201, message: "Wallet updated successfully", wallet }
  } catch (error) {
    return { status: 500, message: "Error processing wallet: " + error.message }
  }
}
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
      const apiKey = process.env.EXCHANGE_RATES_API_KEY
      const url = `http://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}&base=${fromCurrency}&symbols=${toCurrency}`
      const response = await fetch(url)
    if (!response.ok) {
      return { status: 500, message: `HTTP error! Status: ${response.status}` }
    }
      const data = await response.json()
      const rate = data.rates[toCurrency]
    if (!rate) {
      return { status: 500, message: `Unable to find exchange rate for ${toCurrency}` }
    }
      baseUnit = amount / 100
      const convertedAmount = baseUnit * rate
      return convertedAmount
  } catch (error) {
     return { status: 500, message: "Error converting currency:: " + error.message }
  }
 
}


module.exports = {
  createUnpaidOrder,
  updateOrderStatus,
  createTransaction,
  creditWallet,
  convertCurrency,
}
