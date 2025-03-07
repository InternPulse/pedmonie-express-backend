const express = require('express')
const { initiatePayment, verifyPayment} = require('../services/stripe')
const router = express.Router()

router.post("/orders-stripe", initiatePayment)

router.get("/orders-stripe/:session_id", verifyPayment)

module.exports = router