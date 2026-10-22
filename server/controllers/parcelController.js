const Parcel = require("../models/Parcel");
const User = require("../models/User");
const RouteReport = require("../models/RouteReport");

const STATUSES = ["pending", "picked", "in-transit", "delivered", "cancelled"];

// Make a simple tracking id like SD-LK3F9A2XYZ
const makeTrackingId = () =>
  "SD-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

// Customer: create a parcel
exports.createParcel = async (req, res) => {
  try {
    const { receiverName, receiverPhone, receiverAddress, weight, lng, lat } = req.body;
    if (!receiverName || !receiverPhone || !receiverAddress || weight == null || lng == null || lat == null) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const parcel = await Parcel.create({
      trackingId: makeTrackingId(),
      sender: req.user._id,
      receiverName,
      receiverPhone,
      receiverAddress,
      weight,
      deliveryLocation: { type: "Point", coordinates: [Number(lng), Number(lat)] },
    });
    res.status(201).json({ trackingId: parcel.trackingId, parcel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Customer sees own, agent sees assigned, admin sees all
exports.getParcels = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "customer") filter = { sender: req.user._id };
    if (req.user.role === "agent") filter = { assignedAgent: req.user._id };

    const parcels = await Parcel.find(filter)
      .populate("sender", "name email")
      .populate("assignedAgent", "name email")
      .sort({ createdAt: -1 });
    res.json(parcels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public: track a parcel and calculate its route safety score
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

// Admin: assign an agent to a parcel
exports.assignParcel = async (req, res) => {
  try {
    const agent = await User.findOne({ _id: req.body.agentId, role: "agent" });
    if (!agent) return res.status(400).json({ message: "Agent not found" });

    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      { assignedAgent: agent._id },
      { new: true }
    );
    if (!parcel) return res.status(404).json({ message: "Parcel not found" });
    res.json(parcel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Agent: update status of a parcel assigned to them
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) return res.status(404).json({ message: "Parcel not found" });

    if (!parcel.assignedAgent || parcel.assignedAgent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This parcel is not assigned to you" });
    }
    parcel.status = status;
    await parcel.save();
    res.json(parcel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
