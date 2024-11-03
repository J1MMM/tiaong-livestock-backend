const express = require("express");
const { handleLogin } = require("../../../controllers/farmersController");
const router = express.Router();

router.post("/", handleLogin);

module.exports = router;
