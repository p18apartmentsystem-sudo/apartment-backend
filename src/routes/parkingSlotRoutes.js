const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/parkingSlotController");

router.post("/slot", auth, role("apartment_admin"), controller.addParkingSlot);
router.post("/slot/bulk", auth, role("apartment_admin"), controller.bulkAddParkingSlots);
router.get("/:id", auth, role("apartment_admin"), controller.getParkingSlotsByApartmentId);

module.exports = router;