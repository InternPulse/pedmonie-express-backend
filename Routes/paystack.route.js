const express = require('express');
const router = express.Router();

const { makePaymentRequest, verifyPayment, getPaymentDetails } = require('../controller/paystack')


router.post('/payments', makePaymentRequest)
router.get('/payments', verifyPayment)
router.get('/admin/payments/:id', getPaymentDetails)


module.exports = router;