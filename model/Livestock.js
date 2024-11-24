const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LivestockSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  farmerID: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
  barangay: { type: String },
  livestock: {
    cow: { type: Number, default: 0 },
    goat: { type: Number, default: 0 },
    chicken: { type: Number, default: 0 },
    duck: { type: Number, default: 0 },
    carabao: { type: Number, default: 0 },
    pig: { type: Number, default: 0 },
    horse: { type: Number, default: 0 },
  },
  mortality: {
    cow: { type: Number, default: 0 },
    goat: { type: Number, default: 0 },
    chicken: { type: Number, default: 0 },
    duck: { type: Number, default: 0 },
    carabao: { type: Number, default: 0 },
    pig: { type: Number, default: 0 },
    horse: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model("Livestock", LivestockSchema);
