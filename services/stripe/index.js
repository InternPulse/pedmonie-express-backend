// const Stripe = require('stripe')
// const { v4: uuidv4 } = require("uuid")
// const { createUnpaidOrder, updatedOrderStatus, createTransaction } = require('../../controller/stripe/index')

// require('dotenv').config()

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
// exports.stripe = stripe
// const successUrl = process.env.SUCCESS_URL
// const cancelUrl = process.env.CANCEL_URL

// const orderCheckout = async (req, res) => {
//   const { email, amount, currency } = req.body

//   if (!email || !amount || !currency) {
//     return res.status(400).json({ message: "Please provide all required fields" })
//   }
//   const order_id = uuidv4()
//   try {
//     // Create Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       customer_email: email,
//       line_items: [
//         {
//           price_data: {
//             currency: currency.toUpperCase(),
//             product_data: {
//               name: "Phone",
//               description: "Payment for order",
//             },
//             unit_amount: amount * 100,
//           },
//           quantity: 1,
//         },
//       ],
//       success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`, //and then calls the verifyCheckout endpoint
//       cancel_url: cancelUrl,
//       metadata: {
//         order_id,
//       },
//     })
//       //Saving the details to DB
//       //await createUnpaidOrder(orderData)

//       res.status(200).json({
//         status: "success",
//         message: "Payment URL created",
//         url: session.url,
//         session_id: session.id,
//         payment_status: session.payment_status,
//         //session
//     })
//   } catch (error) {
//         console.log(error)
//         res.status(500).json({ message: "Internal Server Error" })
//   }
// }

// //to used for production
// // const handleWebhook = async (req, res) => {
// //     const sig = req.headers["stripe-signature"]
// //     let event

// //     try {
// //         event = stripe.webhooks.constructEvent( req.body, sig, process.env.STRIPE_WEBHOOK_SECRET )
// //     } catch (error) {
// //         return res.status(400).send(`Webhook Error: ${err.message}`)
// //     }
// //     if (event.type === "checkout.session.completed") {
// //         const session = event.data.object
// //             const { order_id } = session.metadata
// //             await updatedOrderStatus(order_id, "paid")
// //             console.log("Order created via webhook:", order)
// //         }
// //         res.json({ received: true })
// // }

// const verifyCheckout = async (req, res) => {
//     const { session_id } = req.params
//     try {
//         const session = await stripe.checkout.sessions.retrieve(session_id)

//         if (session.payment_status === "paid") {
//             const { order_id } = session.metadata

//             // const updatedOrder = await updatedOrderStatus(order_id, "paid")
//             // const transaction = await createTransaction(transactionData)

//             return res.status(200).json({
//                     status: "success",
//                     payment_status: session.payment_status,
//                     message: "Payment verified successfully!",
//                     order_id: order_id,
//                     // order: updatedOrder,
//                     // transaction
//                 })
//         } else {
//           return res.status(400).json({
//                 status: "failed",
//                 message: "Payment not verified!",
//             })
//         }
//     } catch (error) {
//         console.error("Error verifying checkout:", error)
//         return res.status(500).json({
//             status: "error",
//             message: "Internal server error",
//             error: error.message,
//         })
//   }

// }
// module.exports = {
//     orderCheckout,
//     verifyCheckout
// }