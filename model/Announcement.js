const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const announcementSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model("Announcement", announcementSchema);
