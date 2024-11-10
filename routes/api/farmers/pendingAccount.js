const express = require("express");
const {
  savePendingAccount,
} = require("../../../controllers/farmersController");
const router = express.Router();

router.post("/", savePendingAccount);

module.exports = router;
