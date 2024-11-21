const express = require("express");
const {
  handleAddAnnouncement,
  getAnnouncement,
  handleDeleteAnnouncement,
  handleUpdateAnnouncement,
} = require("../../../controllers/announcementController");

const router = express.Router();

router
  .get("/", getAnnouncement)
  .post("/", handleAddAnnouncement)
  .patch("/", handleUpdateAnnouncement)
  .delete("/", handleDeleteAnnouncement);

module.exports = router;
