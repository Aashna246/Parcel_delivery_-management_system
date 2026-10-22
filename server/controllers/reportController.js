const RouteReport = require("../models/RouteReport");

// Agent/admin: create a report
exports.createReport = async (req, res) => {
  try {
    const { category, description, severity, lng, lat, city } = req.body;
    if (!category || !description || !severity || lng == null || lat == null || !city) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const report = await RouteReport.create({
      category,
      description,
      severity,
      city,
      location: { type: "Point", coordinates: [Number(lng), Number(lat)] },
      reportedBy: req.user._id,
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List reports, optional filters: ?city=&category=&severity=
exports.getReports = async (req, res) => {
  try {
    const filter = {};
    if (req.query.city) filter.city = new RegExp("^" + req.query.city.trim() + "$", "i");
    if (req.query.category) filter.category = req.query.category;
    if (req.query.severity) filter.severity = req.query.severity;

    const reports = await RouteReport.find(filter).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Active reports near a point: ?lat=&lng=&radius= (radius in meters)
exports.getNearby = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: "lat and lng are required" });

    const reports = await RouteReport.find({
      status: "active",
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius) || 2000,
        },
      },
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Number of reports per category
exports.getStats = async (req, res) => {
  try {
    const stats = await RouteReport.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: resolve or reject a report
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "resolved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const report = await RouteReport.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
