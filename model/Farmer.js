const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const farmerSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  middlename: String,
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  referenceNo: {
    type: String,
    required: false,
  },
  refreshToken: String,
  isApprove: {
    type: Boolean,
    require: true,
    default: false,
  },
  archive: {
    type: Boolean,
    require: true,
    default: false,
  },
});

module.exports = mongoose.model("Farmer", farmerSchema);
