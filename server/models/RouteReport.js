const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["flooding", "pothole", "roadblock", "festival-traffic", "unsafe-at-night", "accident"],
      required: true,
    },
    description: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
    // GeoJSON point: coordinates are [lng, lat]
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    city: { type: String, required: true },
    status: { type: String, enum: ["active", "resolved", "rejected"], default: "active" },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Needed for $near searches
reportSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("RouteReport", reportSchema);
