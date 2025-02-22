const express = require("express");
const router = express.Router();
const authentication = require('../middlewares/Authentication')
const { getPaymentGateways, createPaymentGateway, updatePaymentGateway, getMerchantPaymentGateways, createMerchantPaymentGateway, updateMerchantPaymentGateway } = require('../controller/PaymentProcessing')
const authorization = require('../middlewares/Authorization')


router.post('/gateways',authentication, authorization(['superadmin']), createPaymentGateway)
router.get('/gateways', authentication, authorization(['superadmin', 'merchant']), getPaymentGateways)
router.patch('/gateways/:gateway_id', authentication, authorization(['superadmin']), updatePaymentGateway)
router.get('/merchants/gateways', authentication, authorization(['superadmin', 'merchant']), getMerchantPaymentGateways)
router.post('/merchants/gateways', authentication, authorization(['superadmin', 'merchant']), createMerchantPaymentGateway)
router.patch('/merchants/gateways', authentication, authorization(['superadmin', 'merchant']), updateMerchantPaymentGateway)



module.exports = router