
const express  = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')

const PaypalRouter = require('./Routes/paypal.route')
const PaystackRouter = require('./Routes/paystack.route')
const PaymentRouter = require('./Routes/paymentprocessing.route')
const flutterwaveRouter = require('./Routes/flutterwave.route');
// const stripeRouter = require("./Routes/stripe.route")
const monnifyRouter = require("./Routes/monnify.route")
const squardRouter = require('./Routes/squad')

// const Merchant = require('./models/merchants.js')


const cors = require("cors");
const helmet = require("helmet");
const limiter = require("./middlewares/rateLimiter");



const port = process.env.APP_PORT || 1111;
const app = express();
const { sequelize } = require("./models/index");
async function connection(){
    try{
        // await sequelize.sync({alter: true});
        console.log('Connection has been established successfully.');
        app.listen(port, ()=>{
        console.log(`Server running on port ${port}`)
})
    }catch(error){
        console.error('Unable to connect to the database:', error);
    }
} 
connection()

const allowedOrigins = [
    'https://localhost:5173',
    'https://pedmonie-frontend-dev.onrender.com/',
    'https://localhost:5174' // Example for local development
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin); // Allow the requesting origin
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allowed HTTP methods
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
    res.header('Access-Control-Expose-Headers', 'Authorization'); // Expose custom headers like Authorization to the frontend
    next(); // Move to the next middleware or route handler
});
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



app.use("/api/v1", squardRouter)

app.use("/api/v1/payments", monnifyRouter);

app.get("/", (req, res) => {
	res.send("Welcome to Pedmonie Express API");
});
