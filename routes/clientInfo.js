const express = require('express')
const clientInfoController =require('../controller/clientInfoController')

const router = express.Router()

router.post('/',clientInfoController.Data);

module.exports = router