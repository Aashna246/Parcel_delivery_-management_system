const router = require("express").Router();
const { register, login, getAgents } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/agents", protect, authorize("admin"), getAgents);

module.exports = router;
