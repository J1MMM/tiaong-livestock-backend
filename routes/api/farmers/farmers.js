const express = require("express");
const {
  handleFarmersArchive,
  getFarmersArchivedData,
  getFarmersData,
  handleFarmersRestore,
} = require("../../../controllers/farmersController");

const router = express.Router();

router.get("/", getFarmersData);
router.get("/archive", getFarmersArchivedData);
router.post("/archive", handleFarmersArchive);
router.post("/restore", handleFarmersRestore);

module.exports = router;
