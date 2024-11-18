const express = require("express");
const {
  handleUpdateLivestock,
} = require("../../../controllers/livestockController");
const router = express.Router();

router.post("/", handleUpdateLivestock);

module.exports = router;
