const express = require("express");
const { verifyCode } = require("../../../controllers/farmersController");
const router = express.Router();

router.post("/", verifyCode);

module.exports = router;
