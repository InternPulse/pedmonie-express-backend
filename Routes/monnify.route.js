const express = require('express');
const router = express.Router();
const PaymentController = require('../controller/monnify.controller');

const { validatePaymentRequest } = require("../validations/monnify/monnify.validator")

// Route to initiate payment
router.post('/initiate', validatePaymentRequest, PaymentController.initiatePayment);

// Route to handle Monnify payment callback
router.get('/verify/:transactionReference', PaymentController.verifyPayment);

module.exports = router;
