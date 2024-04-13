require("dotenv").config()

const express = require('express')
const app = express()

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const clientRouter = require('./routes/clientInfo')
const orderRouter = require('./routes/orderInfo')

app.get('/',(req,res)=>{
    res.send("Connected")
})

app.use("/clientInfo",clientRouter)
app.use("/orderInfo",orderRouter)

app.listen(process.env.PORT,()=>{
    console.log("Stable");
})