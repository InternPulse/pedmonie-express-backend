const express = require('express');
const { createOrderController, completeOrder, createMerchant }= require('../controller/paypal/index')
const router = express.Router(); 


router.post('/orders', createOrderController)

router.get('/orders', completeOrder)

module.exports = router;