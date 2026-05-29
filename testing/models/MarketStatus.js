const mongoose = require("mongoose");

const MarketStatusSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "latest",
      unique: true,
    },
    marketStatus: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketStatus", MarketStatusSchema);