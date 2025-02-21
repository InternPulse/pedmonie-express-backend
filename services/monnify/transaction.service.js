const { Transaction } = require("../../models");
const { Order } = require("../../models");

class TransactionService {
	static async createTransaction(transactionData) {
        try {
            const { order_id, merchant_id, gateway_name, gateway_transaction_identifier, payment_channel, amount, status, currency } = transactionData;
            console.log("merchantId", merchant_id)
            const order = await Order.findOne({ where: { order_id, merchant_id } });
            console.log(order)
            if (!order) throw new Error("Order not found");
    
            const transaction = await Transaction.create({
                order_id,
                merchant_id,
                gateway_name,
                gateway_transaction_identifier,
                payment_channel,
                amount,
                currency,
                status,
            });
    
            return transaction;
        } catch (error) {
            throw new Error(`Failed to create transaction: ${error.message}`);
        }
    }
    
    static async getTransactionByReference(transactionReference) {
        try {
            const transaction = await Transaction.findOne({
                where: { gateway_transaction_identifier: transactionReference },
            });

            return transaction;
        } catch (error) {
            throw new Error(`Failed to fetch transaction: ${error.message}`);
        }
    }

    static async updateTransactionStatus(transactionReference, newStatus, paymentChannel) {
        try {
          // Find the transaction record
          const transaction = await Transaction.findOne({
            where: { gateway_transaction_identifier: transactionReference },
          });
          if (!transaction) {
            throw new Error("Transaction not found");
          }
      
          // Update the status, payment_channel field and save the changes
          transaction.status = newStatus;
          transaction.payment_channel = paymentChannel
          await transaction.save();
      
          return transaction;
        } catch (error) {
          throw new Error(`Failed to update transaction: ${error.message}`);
        }
      }
}

module.exports = TransactionService;
