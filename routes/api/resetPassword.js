const express = require('express')
const { sendMail, updatePwd, checkToken } = require('../../controllers/resetPassController')
const router = express.Router()

router.route('/')
	.post(sendMail)
	.put(updatePwd)
	
router.route('/:token')
	.post(checkToken)

module.exports = router