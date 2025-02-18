const express = require('express');
const { initializePayment, verifyPayment}= require('../controller/squad')
const router = express.Router(); 


router.post('/initiate', initializePayment)
router.get('/verify', verifyPayment)


module.exports = router;