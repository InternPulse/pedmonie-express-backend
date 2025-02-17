const express = require("express");
const router = express.Router();
const flutterwaveController = require("../controller/flutterwave");

// Endpoint to initialize the payment transaction
router.post("/:merchant_id", flutterwaveController.createTransaction);

// Endpoint to verify the transaction
router.get("/verify/:transaction_id", flutterwaveController.verifyTransaction);

module.exports = router;
