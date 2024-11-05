const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PendingFarmerSchema = new Schema({
  // firstname: {
  //   type: String,
  //   required: false,
  // },
  // lastname: {
  //   type: String,
  //   required: false,
  // },
  // middlename: String,
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  verificationCode: {
    type: String,
    required: false,
  },
  // referenceNo: {
  //   type: String,
  //   required: false,
  // },

  // isApprove: {
  //   type: Boolean,
  //   require: true,
  //   default: false,
  // },
  // archive: {
  //   type: Boolean,
  //   require: true,
  //   default: false,
  // },
});

module.exports = mongoose.model("PendingFarmer", PendingFarmerSchema);
