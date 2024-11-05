const express = require("express");
const {
  resendVerification,
} = require("../../../controllers/farmersController");
const router = express.Router();

router.post("/", resendVerification);

module.exports = router;
