const express = require("express");
const {
  handleUpdateLivestock,
  getHeatmapData,
  getTotalCountLivestock,
  getYearlyRecordData,
  getBrangayRecords,
  getTotalLivestockMortality,
  getLivesstockMobileDashboard,
  getFarmerYearlyLivestocks,
  getFarmerYearlyMoratlity,
  getFarmersPerBrgy,
} = require("../../../controllers/livestockController");
const router = express.Router();

router.get("/", getHeatmapData).post("/", handleUpdateLivestock);
router.get("/total", getTotalCountLivestock);
router.get("/barangay-records", getBrangayRecords);
router.get("/farmers-per-brgy", getFarmersPerBrgy);
router.post("/yearly-records", getYearlyRecordData);
router.post("/total-livestock-mortality", getTotalLivestockMortality);
router.post("/total-livestock-barchart", getLivesstockMobileDashboard);
router.post("/farmer-yearly-livestock", getFarmerYearlyLivestocks);
router.post("/farmer-yearly-mortality", getFarmerYearlyMoratlity);

module.exports = router;
