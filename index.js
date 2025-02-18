const express  = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const PaypalRouter = require('./Routes/paypal.route')
const SquadRouter = require('./Routes/squad.js')
const port = process.env.APP_PORT || 1111
const app = express()
// const {sequelize} = require('./models/index')

app.use(express.json());


app.use(bodyParser.urlencoded({ extended: false }));
app.use(PaypalRouter)
app.use(SquadRouter)


app.listen(port, ()=>{
    console.log("app is runing at 1111")
})