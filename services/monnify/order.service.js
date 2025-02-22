const { Order } = require("../../models");

class OrderService {
	static async createOrder(amount, currency, merchant_id, gateway_name) {
		try {
			const order = await Order.create({
				amount,
				currency,
				merchant_id,
				order_status: "Pending",
				gateway_name: "monnify",
			});
			return order;
		} catch (error) {
			throw new Error(`Failed to create order: ${error.message}`);
		}
	}

	static async updateOrderStatus(order_id, newStatus) {
		try {
			const order = await Order.findOne({ where: { order_id } });
            console.log(order)
			if (!order) {
				throw new Error("Order not found");
			}

			order.order_status = newStatus;
			await order.save();

			return order;
		} catch (error) {
			throw new Error(`Failed to update order status: ${error.message}`);
		}
	}

	static async getOrderById(order_id) {
		try {
			const order = await Order.findOne({ where: { order_id } });
			if (!order) {
				throw new Error("Order not found");
			}
			return order;
		} catch (error) {
			console.error(`Error fetching order by ID: ${error.message}`);
			throw error;
		}
	}
}

module.exports = OrderService;
