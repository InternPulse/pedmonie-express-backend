const express = require('express')
const { orderCheckout, verifyCheckout } = require('../services/stripe/index')

const router = express.Router()

router.post("/stripe_orders", orderCheckout)
router.get("/stripe_orders/:session_id", verifyCheckout)

module.exports = router