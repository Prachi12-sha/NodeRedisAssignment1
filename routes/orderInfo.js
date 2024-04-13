const express = require('express')
const orderInfoController =require('../controller/orderInfoController')

const router = express.Router()

router.post('/',orderInfoController.Data);

module.exports = router