const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
  refreshToken: String,

  archive: {
    type: Boolean,
    require: true,
    default: false,
  },
  verified: {
    type: Boolean,
    require: true,
    default: false,
  },
  otp: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
