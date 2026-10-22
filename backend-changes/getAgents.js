// controllers/authController.js -> add this function (and export it)
exports.getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: "agent" }).select("name email");
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// routes/authRoutes.js -> add this route (use YOUR middleware names from middleware/auth.js)
// router.get("/agents", protect, authorize("admin"), getAgents);
