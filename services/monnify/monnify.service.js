const axios = require("axios");
const dotenv = require("dotenv");
const OrderService = require("./order.service");

dotenv.config();

const {
	MONNIFY_BASE_URL,
	MONNIFY_API_KEY,
	MONNIFY_SECRET_KEY,
	MONNIFY_CONTRACT_CODE,
} = process.env;

class MonnifyService {
	/**
	 * Generates authentication token from Monnify
	 * @returns {Promise<string>} - Returns access token
	 */
	static async generateAuthToken() {
		try {
			const credentials = Buffer.from(
				`${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`
			).toString("base64");
			const response = await axios.post(
				`${MONNIFY_BASE_URL}/api/v1/auth/login`,
				{},
				{
					headers: {
						Authorization: `Basic ${credentials}`,
						"Content-Type": "application/json",
					},
				}
			);

			const accessToken = response.data?.responseBody?.accessToken;
			if (!accessToken) {
				throw new Error("Auth token not received from Monnify");
			}

			return accessToken;
		} catch (error) {
			throw new Error(
				`Failed to authenticate with Monnify: ${
					error.response?.data || error.message
				}`
			);
		}
	}

	
	static async initializePayment(order_id) {
		try {
			const order = await OrderService.getOrderById(order_id);

			if (!order) {
				throw new Error("Order not found");
			}

			const accessToken = await this.generateAuthToken();

			const response = await axios.post(
				`${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
				{
					amount: parseFloat(order.amount),
					currencyCode: order.currency,
					paymentReference: order.order_id,
					redirectUrl:
						"https://my-merchants-page.com/transaction/confirm",
					customerEmail: "user@example.com",
					customerName: "robert",
					paymentDescription: "Payment for Order",
					paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
					contractCode: MONNIFY_CONTRACT_CODE,
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": "application/json",
					},
				}
			);

			return response.data.responseBody;
		} catch (error) {
			console.log(error.message);
			throw new Error(
				`Payment initialization failed: ${
					error.response?.data || error.message
				}`
			);
		}
	}


	static async verifyPayment(transactionReference) {
		try {
			const accessToken = await this.generateAuthToken();
			const encodedReference = encodeURIComponent(transactionReference);
            const response = await axios.get(
				`${MONNIFY_BASE_URL}/api/v1/transactions/${encodedReference}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			return response.data.responseBody;
		} catch (error) {
			throw new Error(
				`Payment verification failed: ${
					error.response?.data?.message || error.message
				}`
			);
		}
	}
}

module.exports = MonnifyService;
