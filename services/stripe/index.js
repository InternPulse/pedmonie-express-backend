const Stripe = require("stripe")
const { validateOrder } = require("../../validations/stripe")
const { createUnpaidOrder, createTransaction, creditWallet } = require("../../controller/stripe/index")
const { sequelize } = require("../../models")
const Order = require('../../models/order')(sequelize, require("sequelize").DataTypes)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const successUrl = process.env.SUCCESS_URL
const cancelUrl = process.env.CANCEL_URL


const initiatePayment = async (req, res) => {
  const { email, amount, currency, merchantId } = req.body

  const { error } = validateOrder(req.body)
  if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }
    const orderData = {
        merchant_id: merchantId,
        gateway_name: "",
        amount: amount,
        currency: currency,
        order_status: "",
    }
    try {
      //Saving the details to order table
        const order = await createUnpaidOrder(orderData)
        
      //a stripe checkout session to initiate payment
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: currency.toUpperCase(),
              product_data: {
                name: "product",
              },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          merchant_id: merchantId,
          order_id: order.order.dataValues.order_id,
        },
      })
        
        // console.info(order.order.dataValues.order_id)
      res.status(200).json({
        status: "success",
        message: "Payment URL created",
        data: {
          url: session.url,
          session_id: session.id,
          payment_status: session.payment_status,
        },
        // session,
      })
    } catch (error) {
        res.status(500).json({
            status: "error", 
            message: "Internal Server Error"
        })

    }
  
}
const verifyPayment = async (req, res) => {
  const t = await sequelize.transaction()
  const { session_id } = req.params
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    const { merchant_id, order_id } = session.metadata
    //to check if session exist
    /*
    
    */
    const order = await Order.findOne({ where: { order_id } })

    if (!order) {
      await t.rollback()
      return res.status(404).json({
        status: "failed",
        message: "Order not found!",
      })
    }

    if (session.payment_status == "unpaid") {
      await t.rollback()
      return res.status(400).json({
        status: "failed",
        message: "Payment not verified!",
      })
    }
    if (session.payment_status === "paid") {
      const transactionData = {
        order_id,
        merchant_id,
        gateway_name: "",
        gateway_transaction_identifier: session_id,
        amount: session.amount_total / 100,
        payment_channel: "",
        status: "",
        currency: session.currency,
      }
      const transaction = await createTransaction(transactionData, { transaction: t, })
      const walletData = {
        merchant_id,
        amount: session.amount_total / 100,
        currency: session.currency,
      }
          // Credit the wallet or create if not found
      const wallet = await creditWallet(walletData, { transaction: t })
      const updatedOrderStatus = async () => {
       await order.update({ order_status: "paid" }, { transaction: t })
     }
     const updatedOrder = await updatedOrderStatus()

      await t.commit()
      console.log(updatedOrder)
      console.log("Wallet amount:", wallet.amount, typeof wallet.amount)
      console.log("Order amount:", order.amount, typeof order.amount)
      return res.status(200).json({
        status: "success",
        message: "Payment verified successfully!",
        order_id,
        transaction,
        wallet,
      })
    } else {
      await t.rollback()

      return res.status(400).json({
        status: "failed",
        message: "Payment not verified!",
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
    initiatePayment,
    verifyPayment
}