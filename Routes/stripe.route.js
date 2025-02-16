const express = require('express')
const { orderCheckout, verifyCheckout } = require('../services/stripe/index')

const router = express.Router()

router.post("/orders-stripe", orderCheckout)
router.get("/orders-stripe/:session_id", verifyCheckout)

module.exports = router