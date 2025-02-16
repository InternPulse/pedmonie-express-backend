const { sequelize } = require("../../models/index.js")

const Order = require("../../models/order.js")(sequelize, require("sequelize").DataTypes)
const Transaction = require("../../models/transaction.js")(sequelize, require("sequelize").DataTypes
)

const createUnpaidOrder = async (orderData) => {
  const order = await Order.create({
    order_id: orderData.order_id,
    amount: orderData.amount,
    currency: orderData.currency,
    payment_status: "pending",
  })
  return order
}

// Update order in the database
const updateOrderStatus = async (order_id, payment_status) => {
  const order = await Order.update(
    { payment_status }, // Update the payment_status
    { where: { order_id } } // Find the order by order_id
  )
  return order
}

const createTransaction = async (transactionData) => {
  const transaction = await Transaction.create({
    order_id: transactionData.order_id,
    transaction_id: session.payment_intent,
    amount: session.amount_total / 100,
    currency: session_currency,
    payment_method: session.payment_method_types[0], // e.g., "card"
    status: "successful",
  })
  return transaction
}

module.exports = {
  createUnpaidOrder,
  updateOrderStatus,
  createTransaction,
}
