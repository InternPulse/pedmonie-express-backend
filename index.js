const express  = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const PaypalRouter = require('./Routes/paypal.route')
const port = process.env.APP_PORT || 1111
const app = express()
// const {sequelize} = require('./models/index')

app.use(express.json());

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(PaypalRouter)