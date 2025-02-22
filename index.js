const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const limiter = require("./middlewares/rateLimiter");
const bodyParser = require("body-parser");
const PaypalRouter = require("./Routes/paypal.route");

// const stripeRouter = require('./Routes/stripe.route')
const PaystackRouter = require("./Routes/paystack.route");
const PaymentRouter = require("./Routes/paymentprocessing.route");
const stripeRouter = require("./Routes/stripe.route");
const flutterwaveRouter = require("./Routes/flutterwave.route");
const monnifyRouter = require("./Routes/monnify.route");

const port = process.env.APP_PORT || 1111;
const app = express();
const { sequelize } = require("./models/index");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "5mb" }));
app.use(cors());
app.use(helmet());
app.use(limiter);
app.use("/api/v1", PaymentRouter);

app.use("/api/v1", PaypalRouter);

app.use("/api/v1", PaystackRouter);
// app.use(stripeRouter)

app.use("/api/v1", flutterwaveRouter);

app.use("/api/v1/payments", monnifyRouter);

app.get("/", (req, res) => {
	res.send("Welcome to Pedmonie Express API");
});

const startServer = async () => {
	try {
		if (sequelize) {
			await sequelize.authenticate();
			console.info(
				"Database connection has been established successfully."
			);
			// Optionally synchronize the database:
			 //await sequelize.sync({ alter: true });
			 //console.info("Database synchronized.");
		}
		app.listen(port, () =>
			console.info(`🚀 Server running on port ${port}`)
		);
	} catch (error) {
		console.error("Error starting server:", error.message);
		process.exit(1);
	}
};

startServer();
