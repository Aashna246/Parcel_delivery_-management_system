// controllers/parcelController.js  -> replace your trackParcel with this
// (needs at the top: const RouteReport = require("../models/RouteReport");)
exports.trackParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({ trackingId: req.params.trackingId })
      .populate("assignedAgent", "name");

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    let safetyScore = 100; // start with a perfect score

    if (parcel.deliveryLocation && parcel.deliveryLocation.coordinates) {
      // Active reports within 2 km (2000 m) of the delivery point
      const reports = await RouteReport.find({
        status: "active",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: parcel.deliveryLocation.coordinates,
            },
            $maxDistance: 2000,
          },
        },
      });

      // Subtract points by severity
      reports.forEach((r) => {
        if (r.severity === "high") safetyScore -= 20;
        else if (r.severity === "medium") safetyScore -= 10;
        else if (r.severity === "low") safetyScore -= 5;
      });

      safetyScore = Math.max(0, safetyScore); // never below 0
    }

    res.json({
      trackingId: parcel.trackingId,
      receiverName: parcel.receiverName,
      receiverAddress: parcel.receiverAddress,
      status: parcel.status,
      safetyScore,
      assignedAgent: parcel.assignedAgent,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
