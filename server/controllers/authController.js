const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Create a token that lasts 7 days
const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sendAuth = (res, user, status = 200) => {
  res.status(status).json({
    token: makeToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const safeRole = ["customer", "agent", "admin"].includes(role) ? role : "customer";
    const user = await User.create({ name, email, password: hashed, role: safeRole });
    sendAuth(res, user, 201);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    sendAuth(res, user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: list of agents for the assign dropdown
exports.getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: "agent" }).select("name email");
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
