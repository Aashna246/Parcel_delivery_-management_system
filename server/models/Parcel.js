const mongoose = require("mongoose");

const parcelSchema = new mongoose.Schema(
  {
    trackingId: { type: String, unique: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverName: { type: String, required: true },
    receiverPhone: { type: String, required: true },
    receiverAddress: { type: String, required: true },
    weight: { type: Number, required: true },
    // GeoJSON point: coordinates are [lng, lat]
    deliveryLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    status: {
      type: String,
      enum: ["pending", "picked", "in-transit", "delivered", "cancelled"],
      default: "pending",
    },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

parcelSchema.index({ deliveryLocation: "2dsphere" });

module.exports = mongoose.model("Parcel", parcelSchema);
