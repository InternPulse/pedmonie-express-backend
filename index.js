
const express  = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const PaypalRouter = require('./Routes/paypal.route')

// const stripeRouter = require('./Routes/stripe.route')
const PaystackRouter = require('./Routes/paystack.route')
const PaymentRouter = require('./Routes/paymentprocessing.route')
const flutterwaveRouter = require('./Routes/flutterwave.route');
// const Merchant = require('./models/merchants.js')


const cors = require("cors");
const helmet = require("helmet");
const limiter = require("./middlewares/rateLimiter");

// const stripeRouter = require("./Routes/stripe.route");
const monnifyRouter = require("./Routes/monnify.route");

const port = process.env.APP_PORT || 1111;
const app = express();
const { sequelize } = require("./models/index");

async function connection(){
    try{
        await sequelize.sync()
        console.log('Connection has been established successfully.');
        app.listen(port, ()=>{
        console.log(`Server running on port ${port}`)
})
    }catch(error){
        console.error('Unable to connect to the database:', error);
    }
} 
connection()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "5mb" }));
app.use(cors());
app.use(helmet());
app.use(limiter);
app.use("/api/v1", PaymentRouter);

app.use("/api/v1", PaypalRouter);


app.use("/api/v1", PaystackRouter)

// app.use('/api/v1', stripeRouter)


app.use("/api/v1", flutterwaveRouter);

app.use("/api/v1/payments", monnifyRouter);

app.get("/", (req, res) => {
	res.send("Welcome to Pedmonie Express API");
});
