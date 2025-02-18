const express = require("express");
const router = express.Router();
const flutterwaveController = require("../controller/flutterwave");

// Endpoint to initialize the payment transaction
router.post("/:merchant_id", flutterwaveController.createOrder);

router.get('/callback', flutterwaveController.flutterwaveCallback);

module.exports = router;
