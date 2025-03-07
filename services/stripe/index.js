const Stripe = require("stripe")
const ShortUniqueId = require("short-uuid")

const { sequelize } = require("../../models")
const { validateOrder } = require("../../validations/stripe")
const { convertCurrency } = require("../../controller/stripe/index")

const Order = require('../../models/order')(sequelize, require("sequelize").DataTypes)
const Wallet = require('../../models/wallet')(sequelize, require("sequelize").DataTypes)
const Transaction = require('../../models/transaction')(sequelize, require("sequelize").DataTypes)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const successUrl = process.env.SUCCESS_URL
const cancelUrl = process.env.CANCEL_URL
const shortUuid = ShortUniqueId()

const initiatePayment = async (req, res) => {
  const { email, amount, currency, merchantId } = req.body
  const currencyCode = currency.toUpperCase()
  const gatewayUserTransactionId = `USR-${shortUuid.generate()}`
  const gatewayWalletTransactionId = `PTW-${shortUuid.generate()}`
  
  const { error } = validateOrder(req.body)
  if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }
    const orderData = {
      merchant_id: merchantId,
      gateway_name: "Stripe",
      amount: amount,
      currency: currencyCode,
      order_status: "pending",
    }
  try {
    // Creating unpaid order and saving the details to Order table
    const order = await Order.create(orderData)

    if (!order) {
      return res.status(400).json({
        status: false,
        message: "Error creating order!",
        error: error.message,
      })
    }
    const orderId = order.order_id // from unpaid Order table

    // a stripe checkout session to initiate payment
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: String(currencyCode),
            product_data: {
              name: "product",
            },
            unit_amount: String(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`, // a page user gets redirected to after payment is confirmed
      cancel_url: `${cancelUrl}?session_id={CHECKOUT_SESSION_ID}`, // another page if payment was canceled
      metadata: {
        gateway_user_id: gatewayUserTransactionId,
        gateway_wallet_id: gatewayWalletTransactionId,
        merchant_id: merchantId,
        order_id: orderId,
      },
    })

    if (!session) {
      return res.status(400).json({
        status: false,
        message: "Error initiating payment!",
        error: error.message,
      })
    }
    // Create escrow to merchant transaction
    const savedTransaction = {
      order_id: orderId,
      merchant_id: merchantId,
      gateway_name: "Stripe",
      gateway_transaction_identifier: gatewayWalletTransactionId,
      amount: amount,
      payment_channel: "Card",
      status: "pending",
      currency: currencyCode,
    }
    await Transaction.create(savedTransaction)

    // create user to escrow transaction
    const userTransaction = {
      order_id: orderId,
      merchant_id: merchantId,
      gateway_name: "Stripe",
      gateway_transaction_identifier: gatewayUserTransactionId,
      amount: amount,
      payment_channel: "Card",
      status: "pending",
      currency: countryCode,
    }
    await Transaction.create(userTransaction)

    res.status(200).json({
      status: "success",
      message: "Payment URL created",
      data: {
        url: session.url,
        session_id: session.id,
        payment_status: session.payment_status,
      },
      //session,
    })
  } catch (error) {
    res.status(500).json({
        status: "error", 
        message: "Internal Server Error",
        error: error.message
    })
  }
}

const verifyPayment = async (req, res) => {
  const t = await sequelize.transaction()
  const { session_id } = req.query

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    const value = session.amount_total / 100
    const currency = session.currency
    const { merchant_id, order_id, gateway_user_id, gateway_wallet_id } = session.metadata 

    const order = await Order.findOne({ where: { order_id } })
    if (!order) {
      await t.rollback()
      return res.status(404).json({
        status: "failed",
        message: "Order not found!",
      })
    }
    if (order.order_status === "successful") {
      await t.rollback()
      return res.status(400).json({
        status: "failed",
        message: "Order has already been paid for!",
      })
    }
    // manual payment verification
    if (session.payment_status == "unpaid") {
      // Check if a pending transaction already exists
      const existingTransaction = await Transaction.findOne({
        where: {
          gateway_transaction_identifier: gateway_wallet_id,
        },
      })

      if (existingTransaction) {
        return res.status(200).json({
          status: "success",
          message: "Payment already initiated but not verified!",
          existingTransaction,
        })
      }
    }

    if (session.payment_status === "paid") {
      const convert = await convertCurrency(currency)
      if (convert == null) {
        res.status(404).json({
          status: false,
          message: "An error occured!",
        })
      }
      const converted = (value * convert["NGN"]).toFixed(2)

      // update user to escrow transaction status
      const userTransaction = await Transaction.update(
        { status: "successful" },
        {
          where: { gateway_transaction_identifier: gateway_user_id },
          transaction: t,
        }
      )
      // update order status
      const updateOrderStatus = await Order.update(
        {
          order_status: "successful",
          amount: converted,
          currency: "NGN",
        },
        { where: { order_id }, transaction: t } // Find the order by order_id
      )
      // get merchant wallet and update
      const getWallet = await Wallet.findOne({ where: merchant_id }, { transaction: t })
      if (!getWallet) {
        return res.status(404).json({
          status: false,
          message: "Wallet not found!",
        })
      }
      const incrementAmount = Number(getWallet.amount) + Number(converted)
      // update wallet
      const wallet = await getWallet.update({ amount: incrementAmount })
      
      // update transaction to wallet status
      const walletTransaction = await Transaction.update(
        { status: "successful",
          amount: converted,
          currency: "NGN" },
        {
          where: { gateway_transaction_identifier: gateway_wallet_id },
          transaction: t,
        } 
      )
      await t.commit()
      return res.status(200).json({
        status: "success",
        message: "Payment verified successfully!",
        updateOrderStatus,
        userTransaction,
        wallet,
        walletTransaction,
      })
    } else {
      await t.rollback() 
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

const cancelPayment = async (req, res) => {
  const { session_id } = req.query

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    const { order_id, gateway_user_id, gateway_wallet_id } = session.metadata

    const order = await Order.findOne({ where: { order_id } })
    if (!order) {
      await t.rollback()
      return res.status(404).json({
        status: "failed",
        message: "Order not found!",
      })
    }
    if (order.order_status === "successful") {
      return res.status(400).json({
        status: "failed",
        message: "Order has already been paid for!",
      })
    }
    if (order.order_status === "failed") {
      return res.status(400).json({
        status: "failed",
        message: "Order has already been canceled!",
      })
    }

    // update order status
    const updateOrderStatus = await Order.update(
      {
        order_status: "failed",
      },
      { where: { order_id }, transaction: t }
    )

    // update user transaction to escrow status
    const userTransaction = await Transaction.update(
      { status: "failed" },
      {
        where: { gateway_transaction_identifier: gateway_user_id },
        transaction: t,
      }
    )

    // update escrow transaction to wallet status
    const walletTransaction = await Transaction.update(
      { status: "failed" },
      {
        where: { gateway_transaction_identifier: gateway_wallet_id },
        transaction: t,
      }
    )
    await t.rollback()
    return res.status(200).json({
      status: "success",
      message: "Order canceled succesfully!",
      updateOrderStatus,
      userTransaction,
      walletTransaction,
    })
  } catch (error) {
    console.error("Error cancelling checkout:", error)
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    })
  }
}

module.exports = {
  initiatePayment,
  verifyPayment,
  cancelPayment
}