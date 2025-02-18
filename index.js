const express  = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const PaypalRouter = require('./Routes/paypal.route')

// const stripeRouter = require('./Routes/stripe.route')
const PaystackRouter = require('./Routes/paystack.route')

const stripeRouter = require('./Routes/stripe.route')
const flutterwaveRouter = require('./Routes/flutterwave.route');


const port = process.env.APP_PORT || 1111
const app = express()
const {sequelize} = require('./models/index')

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())

app.use("/api/v1",PaypalRouter)


app.use("/api/v1", PaystackRouter)
// app.use(stripeRouter)

app.use('/api/v1', flutterwaveRouter);


app.get('/', (req, res)=>{
    res.send('Welcome to Express API')
})

