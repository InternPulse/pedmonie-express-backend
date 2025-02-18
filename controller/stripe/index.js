const { sequelize } = require("../../models/index.js")

const Order = require("../../models/order.js")(sequelize, require("sequelize").DataTypes)
const Transaction = require("../../models/transaction.js")(sequelize, require("sequelize").DataTypes)
const Wallet = require("../../models/wallet.js")(sequelize, require("sequelize").DataTypes)

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
    return order
  } catch (error) {
    await t.rollback()
    return { status: 500, message: error.message }
  }    
}

// Update order in the database
const updateOrderStatus = async (order_id, payment_status, { transaction: t }) => {
  try {
      const order = await Order.update(
        { payment_status }, // Update the payment_status
        { where: { order_id }, transaction: t } // Find the order by order_id
      )
      return order
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
         gateway_transaction_identifier: transactionData.payment_intent,
         amount: order.amount,
         payment_channel: transactionData.payment_method_types[0],
         status: "successful",
         currency: order.currency,
       }, { transaction: t }
     )
     return transaction
  } catch (error) {
    return ("Error creating transaction: " + error.message)
  }
 
}

const createWallet = async (walletData, { transaction: t }) => {
  try {
    const order = await getOrderForTransaction(walletData.order_id, t)
     const wallet = await Wallet.create(
       {
         merchant_id: order.merchant_id,
         amount: order.amount,
         currency: order.currency,
       }, { transaction: t }
     )
     return wallet
  } catch (error) {
    return ("Error creating wallet: " + error.message)
  }
 
}

module.exports = {
  createUnpaidOrder,
  updateOrderStatus,
  createTransaction,
  createWallet
}
