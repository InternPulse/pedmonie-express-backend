const Stripe = require('stripe')
const { createUnpaidOrder, updateOrderStatus, createTransaction, createWallet } = require('../../controller/stripe/index')
const { validateOrder } = require('../../validations/stripe/index')
const { sequelize } = require("../../models/index.js")
const Transaction = require('../../models/transaction')(sequelize, require("sequelize").DataTypes)
const { v4: uuidv4 } = require('uuid');

require('dotenv').config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
exports.stripe = stripe
const successUrl = process.env.SUCCESS_URL
const cancelUrl = process.env.CANCEL_URL

const orderCheckout = async (req, res) => {
  //to add merchant_id
  const { email, amount, currency, merchantId } = req.body

  const { error } = validateOrder(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
  const orderData = {
    merchant_id: merchantId,
    gateway_name: "Stripe",
    amount,
    currency,
    order_status: "pending",
  }

  try {
    //Saving the details to order table
    const order = await createUnpaidOrder(orderData)

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
        price_data: {
          product_data: {
            name: "product",
          },
          currency: currency.toUpperCase(),
          unit_amount: amount * 100,
        },
          quantity: 1,
          },
        ],
        gateway_transaction_identifier: session.session_id,
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`, 
        cancel_url: cancelUrl,
        metadata: {
          order_id: order.order_id,
          merchant_id: merchantId
        }
    })

    res.status(200).json({
      status: "success",
      message: "Payment URL created",
      data: {
        url: session.url,
        session_id: session.id,
        payment_status: session.payment_status,
      },
      session
    })
  } catch (error) {
        console.log(error)
        res.status(500).json({ status: "error", message: "Internal Server Error" })
      }
}

const verifyCheckout = async (req, res) => {
  const { session_id } = req.params
  const t = await sequelize.transaction()
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id)
      const { order_id, merchant_id } = session.metadata
      const transaction = await Transaction.findOne({ where: { order_id } })

      if (!transaction) {
        return res.status(404).json({
          status: "failed",
          message: "Transaction not found!",
        })
      }

      if (transaction.payment_status !== "paid") {
        return res.status(400).json({
          status: "failed",
          message: "Payment not verified!",
        })
      }

      if (session.payment_status === "paid") {         
        const updatedOrder = await updateOrderStatus(order_id, "successful", { transaction: t })
        
        const transactionData = {
          order_id,
          merchant_id,
          gateway_name: "Stripe",
          gateway_transaction_identifier: session.gateway_transaction_identifier,
          amount: session.amount_total / 100,
          payment_channel: session.payment_method_types[0],
          status: "successful",
          currency: session.currency,
        }
        const transaction = await createTransaction(transactionData, { transaction: t })

        const walletData = {
          merchant_id,
          amount: session.amount_total / 100,
          currency: session.currency,
        }
        const wallet = await createWallet(walletData, { transaction: t })
        //function to credit wallet

        await t.commit()
        return res.status(200).json({
          status: "success",
          message: "Payment verified successfully!",
          order_id,
          order: updatedOrder,
          transaction,
          wallet
        })
  
      } else {
        await t.rollback()
        const updatedOrder = await updateOrderStatus(order_id, "failed", {transaction: t})
        return res.status(400).json({
              status: "failed",
              message: "Payment not verified!", 
              updatedOrder
          })
      }
    } catch (error) {
        console.error("Error verifying checkout:", error)
        return res.status(500).json({
          status: "error",
          message: "Internal server error",
          error: error.message,
        })
  }

}
module.exports = {
    orderCheckout,
    verifyCheckout
}