const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/vehicleController");

router.post("/", auth, role("flat_admin"), controller.addVehicle);
router.get("/flat", auth, role("flat_admin"), controller.getFlatVehicles);
router.get("/my", auth, role("resident"), controller.getMyVehicles);
router.put("/deactivate/:vehicleId", auth, role("flat_admin"), controller.deactivateVehicle);

module.exports = router;