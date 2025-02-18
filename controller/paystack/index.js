const express = require('express');
const axios = require('axios');
const { sequelize } = require('../../models/index.js');
const { messages } = require('../../messages/index.js');

// Models
const Merchant = require('../../models/merchant.js')(sequelize, require('sequelize').DataTypes);
const Order = require('../../models/order.js')(sequelize, require('sequelize').DataTypes);
const Transaction = require('../../models/transaction.js')(sequelize, require('sequelize').DataTypes);
const Wallet = require('../../models/wallet.js')(sequelize, require('sequelize').DataTypes);

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Initialize Payment
const createTransactionOrder = async (req, res) => {
    try {
        const { currency_code, value, merchant_id, email } = req.body;
        
        const merchant = await Merchant.findOne({ where: { merchant_id } });
        if (!merchant) {
            return res.status(404).json({ status: false, message: 'Merchant not found' });
        }

        const order = await Order.create({
            merchant_id,
            gateway_name: 'PAYSTACK',
            order_status: 'pending',
            amount: value,
            currency: currency_code,
        });

        if (!order) {
            return res.status(400).json({ status: false, message: messages.ORDER_FAILED });
        }

        const orderID = order.order_id;
        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            {
                email,
                amount: value * 100, // Convert to kobo
                currency: currency_code,
                reference: orderID,
            },
            { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
        );

        if (!response.data.status) {
            return res.status(400).json({ status: false, message: messages.INITIALIZED_FAILED });
        }

        res.status(201).json({
            status: true,
            message: messages.ORDER_INITIALIZED_SUCCESS,
            data: { order_id: orderID, authorization_url: response.data.data.authorization_url },
        });
    } catch (error) {
        res.status(500).json({ status: false, message: messages.INTERNAL_SERVER_ERROR, error: error.message });
    }
};

// Complete Payment
const completeTransactionOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { reference } = req.query;
        if (!reference) {
            return res.status(400).json({ status: false, message: messages.TOKEN_REQUIRED });
        }

        const checkTransaction = await Transaction.findOne({ where: { gateway_transaction_identifier: reference } });
        if (checkTransaction) {
            return res.status(409).json({ status: false, message: messages.ORDER_PREV_CAPTURED });
        }

        const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
        });

        if (!response.data.status || response.data.data.status !== 'success') {
            return res.status(400).json({ status: false, message: messages.INCOMPLETE_ORDER });
        }

        const order = await Order.findOne({ where: { order_id: reference } });
        if (!order) {
            return res.status(404).json({ status: false, message: 'Order not found' });
        }

        const merchantWallet = await Wallet.findOne({ where: { merchant_id: order.merchant_id } });
        if (!merchantWallet) {
            return res.status(404).json({ status: false, message: messages.WALLET_NOT_FOUND });
        }

        await Order.update({ order_status: 'successful' }, { where: { order_id: reference }, transaction: t });

        const transaction = await Transaction.create({
            order_id: reference,
            merchant_id: order.merchant_id,
            gateway_name: 'PAYSTACK',
            gateway_transaction_identifier: reference,
            payment_channel: 'CARD',
            amount: response.data.data.amount / 100,
            currency: response.data.data.currency,
            status: 'successful'
        }, { transaction: t });

        merchantWallet.amount += response.data.data.amount / 100;
        await merchantWallet.save({ transaction: t });

        await t.commit();

        res.status(200).json({
            status: true,
            message: messages.ORDER_CAPTURED_SUCCESS,
            data: { transaction, wallet: merchantWallet },
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ status: false, message: error.message });
    }
};

// Cancel Order
const cancelTransactionOrder = async (req, res) => {
    try {
        const { reference } = req.query;
        if (!reference) {
            return res.status(400).json({ status: false, message: messages.TOKEN_REQUIRED });
        }

        const order = await Order.findOne({ where: { order_id: reference } });
        if (!order) {
            return res.status(404).json({ status: false, message: 'Order not found' });
        }

        await Order.update({ order_status: 'failed' }, { where: { order_id: reference } });

        res.status(200).json({ status: true, message: messages.ORDER_CANCELLED });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = { createTransactionOrder, completeTransactionOrder, cancelTransactionOrder };
