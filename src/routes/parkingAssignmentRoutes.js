const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/parkingAssignmentController");

router.post("/assign", auth, role("apartment_admin"), controller.assignParking);
router.get("/history/:slotId", auth, role("apartment_admin"), controller.getParkingHistory);

module.exports = router;