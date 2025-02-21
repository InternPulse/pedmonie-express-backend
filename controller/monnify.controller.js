const TransactionService = require("../services/monnify/transaction.service");
const MonnifyService = require("../services/monnify/monnify.service");
const OrderService = require("../services/monnify/order.service");
const WalletService = require("../services/monnify/wallet.service");

class PaymentController {
	static async initiatePayment(req, res, next) {
		try {
			const { currency, amount, merchant_id } = req.body;

			// Validate required fields
			if (!currency || !amount || !merchant_id) {
				return res.status(400).json({
					status: "error",
					message:
						"Invalid payment data. Currency, amount, and merchant_id are required.",
				});
			}
			const order = await OrderService.createOrder(
				amount,
				currency,
				merchant_id
			);

			if (!order) {
				return res.status(500).json({
					status: "error",
					message: "Failed to create order",
				});
			}

			const paymentResponse = await MonnifyService.initializePayment(
				order.order_id
			);

			if (!paymentResponse || !paymentResponse.checkoutUrl) {
				return res.status(500).json({
					status: "error",
					message: "Failed to generate payment link",
					details: paymentResponse || "No response from Monnify",
				});
			}

			await TransactionService.createTransaction({
				order_id: order.order_id,
				merchant_id: merchant_id,
				gateway_name: "Monnify",
				gateway_transaction_identifier:
					paymentResponse.transactionReference,
				payment_channel: "card",
				amount: amount,
				currency: currency,
				status: "pending",
			});

			return res.status(201).json({
				status: "success",
				message: "Payment initiated successfully",
				data: {
					order_id: order.order_id,
					paymentLink: paymentResponse.checkoutUrl,
				},
			});
		} catch (error) {

            if (error.message.includes("getaddrinfo ENOTFOUND sandbox.monnify.com")) {
                return res.status(502).json({
                    status: "error",
                    message: "Payment verification failed: Unable to reach payment gateway. Please try again later.",
                    details: error.message,
                });
            }

			return res.status(500).json({
				status: "error",
				message: "something went wrong",
				details: error.message,
			});
		}
	}

	static async verifyPayment(req, res) {
		const { transactionReference } = req.params;
		console.log("Transaction Reference Received:", transactionReference);

		if (!transactionReference) {
			return res.status(400).json({
				status: "error",
				message: "transaction reference is required",
			});
		}
		try {
			const paymentStatus = await MonnifyService.verifyPayment(
				transactionReference
			);
			console.log("paymentStatus:", paymentStatus);
			if (!paymentStatus) {
				return res.status(500).json({
					status: "error",
					message: "Failed to verify payment",
				});
			}
			// Check if payment is successful
			if (paymentStatus.paymentStatus === "PAID") {
				// Update the order status to completed

				const order = await OrderService.getOrderById(
					paymentStatus.paymentReference
				);
				if (!order) {
					return res.status(404).json({
						status: "error",
						message: "Order not found for this payment reference",
					});
				}

				const existingTransaction =
					await TransactionService.getTransactionByReference(
						transactionReference
					);
				if (
					existingTransaction &&
					existingTransaction.status === "success"
				) {
					return res.status(400).json({
						status: "error",
						message: "Payment has already been processed",
					});
				}

				const orderUpdated = await OrderService.updateOrderStatus(
					paymentStatus.paymentReference,
					"success"
				);
				if (!orderUpdated) {
					return res.status(500).json({
						status: "error",
						message: "Failed to update order status",
					});
				}
				// Log the transaction in the Transaction table
				const transactionUpdated =
					await TransactionService.updateTransactionStatus(
						paymentStatus.transactionReference,
						"success",
						paymentStatus.paymentMethod
					);
				if (!transactionUpdated) {
					return res.status(500).json({
						status: "error",
						message: "Failed to log transaction",
					});
				}
				// Credit the merchant’s wallet
				
				const creditWallet = await WalletService.creditMerchantWallet(
						paymentStatus.paymentReference,
						paymentStatus.amount
					);

                    if (!creditWallet) {
                        return res.status(500).json({
                            status: "error",
                            message: "Failed to credit wallet",
                        });
                    }


				return res.status(200).json({
					status: "success",
					message: "Payment verified successfully",
					data: { order_id: order.order_id, status: "successful" },
				});
			} else if (paymentStatus.paymentStatus === "PENDING") {
				await OrderService.updateOrderStatus(
					paymentStatus.paymentReference,
					"pending"
				);
				await TransactionService.updateTransactionStatus(
					paymentStatus.transactionReference,
					"pending",
					paymentStatus.paymentMethod || "CARD"
				);

				return res.status(202).json({
					status: "pending",
					message:
						"Payment is still pending. Please check again later.",
					
				});
			} else {
				await OrderService.updateOrderStatus(
					paymentStatus.paymentReference,
					"failed"
				);
				await TransactionService.updateTransactionStatus(
					paymentStatus.transactionReference,
					"failed",
					paymentStatus.paymentMethod
				);

				return res.status(400).json({
					status: "error",
					message: "Payment failed",
					
				});
			}
		} catch (error) {
			console.error("Error handling payment callback:", error);
			
            if (error.message.includes("getaddrinfo ENOTFOUND sandbox.monnify.com")) {
                return res.status(502).json({
                    status: "error",
                    message: "Payment verification failed: Unable to reach payment gateway. Please try again later.",
                    details: error.message,
                });
            }

            return res.status(500).json({
				status: "error",
				message: "Internal server error",
				details: error.message,
			});
		}
	}
}

module.exports = PaymentController;
