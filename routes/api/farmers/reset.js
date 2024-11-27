const express = require("express");
const {
  resetPass,
  handleChangePass,
} = require("../../../controllers/farmersController");

const router = express.Router();

router.post("/", handleChangePass);
router.post("/send-code", resetPass);

module.exports = router;
