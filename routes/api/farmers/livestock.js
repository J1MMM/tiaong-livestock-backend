const express = require("express");
const {
  handleUpdateLivestock,
  getHeatmapData,
  getTotalCountLivestock,
  getYearlyRecordData,
  getBrangayRecords,
  getTotalLivestockMortality,
  getLivesstockMobileDashboard,
} = require("../../../controllers/livestockController");
const router = express.Router();

router.get("/", getHeatmapData).post("/", handleUpdateLivestock);
router.get("/total", getTotalCountLivestock);
router.get("/barangay-records", getBrangayRecords);
router.post("/yearly-records", getYearlyRecordData);
router.post("/total-livestock-mortality", getTotalLivestockMortality);
router.post("/total-livestock-barchart", getLivesstockMobileDashboard);

module.exports = router;
