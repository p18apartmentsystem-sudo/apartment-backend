const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/flatController");


//PATH:: /flats....
router.post("/", auth, role("apartment_admin"), controller.addFlat);
router.get("/:apartmentId", auth, role("super_admin", "apartment_admin"), controller.getFlats);
router.put("/:id", auth, role("apartment_admin"), controller.updateFlat);
router.delete("/:id", auth, role("apartment_admin"), controller.deleteFlat);
router.post("/add_flat_admin", auth, role("apartment_admin"), controller.addFlatAdmin);
router.put("/:flatId/update-flat-admin", auth, role("apartment_admin"), controller.updateFlatAdminByFlatId);
router.get("/", auth, role("flat_admin", "resident"), controller.getFlatsByFlatAdmin);

module.exports = router;