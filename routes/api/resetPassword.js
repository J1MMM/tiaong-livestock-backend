const express = require("express");
const {
  sendMail,
  updatePwd,
} = require("../../controllers/resetPassController");
const router = express.Router();

router.route("/").post(sendMail).put(updatePwd);

module.exports = router;
