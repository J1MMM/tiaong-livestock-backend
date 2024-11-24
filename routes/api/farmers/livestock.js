const express = require("express");
const {
  handleUpdateLivestock,
  getHeatmapData,
  getTotalCountLivestock,
  getYearlyRecordData,
  getBrangayRecords,
} = require("../../../controllers/livestockController");
const router = express.Router();

router.get("/", getHeatmapData).post("/", handleUpdateLivestock);
router.get("/total", getTotalCountLivestock);
router.get("/barangay-records", getBrangayRecords);
router.post("/yearly-records", getYearlyRecordData);

module.exports = router;
