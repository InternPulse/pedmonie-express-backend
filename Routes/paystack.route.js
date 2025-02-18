const express = require("express");
const { createTransactionOrder, completeTransactionOrder, cancelTransactionOrder } = require("../controller/paystack/index");
const router = express.Router();

router.post("/orders", createTransactionOrder);

router.get("/orders", completeTransactionOrder);

router.get("/orders", cancelTransactionOrder);

module.exports = router;