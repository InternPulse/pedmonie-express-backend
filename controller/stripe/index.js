const { sequelize } = require("../../models/index.js")

const Order = require("../../models/order.js")(sequelize, require("sequelize").DataTypes)
const Transaction = require("../../models/transaction.js")(sequelize, require("sequelize").DataTypes)
const Wallet = require("../../models/wallet.js")(sequelize, require("sequelize").DataTypes)
const Merchant = require("../../models/merchant.js")(sequelize, require("sequelize").DataTypes)

// Helper function to handle transactions and order retrieval
const getOrderForTransaction = async (order_id, merchant_id, t) => {
  let order
  if (order_id) {
    order = await Order.findOne({ where: { order_id }, transaction: t })
  } else if (merchant_id) {
    order = await Order.findOne({ where: { merchant_id }, transaction: t })
  }

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
const createTransaction = async (transactionData, { transaction: t }) => {
  try {
    // Check if the transaction already exists and is verified
    const existingTransaction = await Transaction.findOne({
      where: {
        order_id: transactionData.order_id,
        merchant_id: transactionData.merchant_id,
        status: "successful",
      },
      transaction: t,
    })
    if (existingTransaction) {
      return {
        status: 409,
        message: "Transaction already exists and is verified",
        transaction: existingTransaction,
      }
    }
    const transaction = await Transaction.create(
      {
        order_id: transactionData.order_id,
        merchant_id: transactionData.merchant_id,
        gateway_name: "Stripe",
        gateway_transaction_identifier: transactionData.gateway_transaction_identifier,
        amount: transactionData.amount,
        payment_channel: "card",
        status: "successful",
        currency: transactionData.currency,
      },
      { transaction: t }
    )
    return {
      status: 201,
      message: "Transaction created successfully",
      transaction,
    }
  } catch (error) {
    return { status: 500, message: "Error creating transaction: " + error.message }
  }
 
}
const creditWallet = async (walletData, { transaction: t }) => {
  try {
    const order = await getOrderForTransaction(null, walletData.merchant_id, t)
    if (order.status === 404) {
      return order
    }
    // Check if wallet exists
    let wallet = await Wallet.findOne({
      where: { merchant_id: order.merchant_id },
      transaction: t,
    })
    if (wallet) {
      // If wallet exists, update balance
      await wallet.update(
        { amount: parseFloat(wallet.amount) + parseFloat(order.amount) },
        { transaction: t }
      )
    } else {
      // If wallet doesn't exist, create new one
      wallet = await Wallet.create(
        {
          merchant_id: order.merchant_id,
          amount: order.amount,
          currency: order.currency,
        },
        { transaction: t }
      )
    }

    return { status: 201, message: "Wallet created successfully", wallet }
  } catch (error) {
    return { status: 500, message: "Error processing wallet: " + error.message }
  }
}


module.exports = {
  createUnpaidOrder,
  createTransaction,
  creditWallet
}
