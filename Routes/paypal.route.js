const express = require('express');
const { createOrderController, completeOrder, cancelOrder }= require('../controller/paypal/index')
const router = express.Router(); 


router.post('/orders', createOrderController)

router.get('/orders', completeOrder)

router.get('/cancelorders', cancelOrder)

module.exports = router;