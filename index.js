const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const PaypalRouter = require("./Routes/paypal.route");
const SquadRouter = require("./Routes/squad");
const port = process.env.APP_PORT || 1111;
const app = express();
const cors = require("cors");
const mysql = require("mysql2")
// const {sequelize} = require('./models/index')

app.use(express.json());

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(SquadRouter);
app.use(PaypalRouter);


app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
