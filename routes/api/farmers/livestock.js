const express = require("express");
const {
  handleUpdateLivestock,
  getLivestockData,
  getLivestockAnalytics,
} = require("../../../controllers/livestockController");
const router = express.Router();

router.get("/", getLivestockData);
router.get("/analytics", getLivestockAnalytics);
router.post("/", handleUpdateLivestock);

module.exports = router;
