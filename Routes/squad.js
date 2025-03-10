const express = require('express');
const { initializePayment, verifyPayment}= require('../controller/squad')
const router = express.Router(); 


router.post('/squad/initiate', initializePayment)
router.get('/squad/verify', verifyPayment)


module.exports = router;


