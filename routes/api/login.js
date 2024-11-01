const express = require('express')
const { handleLogin } = require('../../controllers/loginController')
const router = express.Router()

router.post('/', handleLogin)

module.exports = router