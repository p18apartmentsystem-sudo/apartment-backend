const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/vehicleController");

//PATH:: /vehicles/..
router.post("/", auth, role("flat_admin", "resident"), controller.addVehicle);
router.get("/flat", auth, role("flat_admin", "resident"), controller.getFlatVehicles);
router.get("/apartment/:apartmentId", auth, role("apartment_admin"), controller.getApartmentVehicles);
router.post("/vehicle", auth, role("apartment_admin"), controller.getDetailsByVehicle);
router.get("/my", auth, role("resident", "resident"), controller.getMyVehicles);
router.put("/deactivate/:vehicleId", auth, role("flat_admin", "resident"), controller.deactivateVehicle);

module.exports = router;