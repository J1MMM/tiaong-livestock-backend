const express = require("express");
const { getApprovalData } = require("../../../controllers/approvalController");
const router = express.Router();

router.get("/", getApprovalData);

module.exports = router;
