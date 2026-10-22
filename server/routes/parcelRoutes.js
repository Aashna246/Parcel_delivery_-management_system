const router = require("express").Router();
const c = require("../controllers/parcelController");
const { protect, authorize } = require("../middleware/auth");

router.get("/track/:trackingId", c.trackParcel); // public
router.post("/", protect, authorize("customer"), c.createParcel);
router.get("/", protect, c.getParcels);
router.put("/:id/assign", protect, authorize("admin"), c.assignParcel);
router.put("/:id/status", protect, authorize("agent"), c.updateStatus);

module.exports = router;
