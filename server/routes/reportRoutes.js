const router = require("express").Router();
const c = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/auth");

// Fixed paths first, so they are not mistaken for an :id
router.get("/nearby", c.getNearby);
router.get("/stats", c.getStats);
router.get("/", c.getReports);
router.post("/", protect, authorize("agent", "admin"), c.createReport);
router.put("/:id/status", protect, authorize("admin"), c.updateReportStatus);

module.exports = router;
