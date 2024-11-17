const express = require("express");
const {
  handleFarmersArchive,
  getFarmersArchivedData,
  getFarmersData,
} = require("../../../controllers/farmersController");

const router = express.Router();

router.get("/", getFarmersData);
router.get("/archive", getFarmersArchivedData);
router.post("/archive", handleFarmersArchive);

module.exports = router;
