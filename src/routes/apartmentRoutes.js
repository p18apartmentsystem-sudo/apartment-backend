const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/apartmentController");


//PATH:: /apartments....
router.post("/", auth, role("apartment_admin"), controller.createApartment);
router.get("/", auth, role("apartment_admin"), controller.getApartments);
router.get("/:id", auth, role("apartment_admin"), controller.getApartmentById);
router.put("/:id", auth, role("apartment_admin"), controller.updateApartment);
router.delete("/:id", auth, role("apartment_admin"), controller.deleteApartment);

module.exports = router;