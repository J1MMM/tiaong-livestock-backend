const express = require("express");
const {
  getApprovalData,
  handleReject,
  getRejectedData,
  handleApproval,
} = require("../../../controllers/approvalController");
const router = express.Router();

router.get("/", getApprovalData);
router.post("/", handleApproval);

router.get("/reject", getRejectedData);
router.post("/reject", handleReject);

module.exports = router;
