const { Wallet } = require("../../models");
const { Order } = require("../../models");

class WalletService {
	static async creditMerchantWallet(order_id, amount) {
		try {
            const order = await Order.findOne({ where: { order_id } });
            if (!order) throw new Error("Order not found"); 
            console.log(order)
			// Find the merchant's wallet
			const wallet = await Wallet.findOne({
				where: { merchant_id: order.merchant_id },
			});

			if (!wallet) {
				throw new Error("Wallet not found for the merchant");
			}

			// Credit the wallet with the payment amount
			wallet.amount = parseFloat(wallet.amount) + parseFloat(amount);
			await wallet.save(); 

			return wallet;
		} catch (error) {
			console.error(`Error crediting merchant wallet: ${error.message}`);
			throw error;
		}
	}
}

module.exports = WalletService;
