const express = require("express");
const { registerFarmer } = require("../../../controllers/farmersController");
const router = express.Router();

router.post("/", registerFarmer);

module.exports = router;
