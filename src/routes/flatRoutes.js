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
router.put("/assign/:id", auth, role("apartment_admin"), controller.assignFlat);
router.post("/add_flat_admin", auth, role("apartment_admin"), controller.addFlatAdmin);
router.put("/:flatId/update-flat-admin", auth, role("apartment_admin"), controller.updateFlatAdminByFlatId);
router.get("/", auth, role("flat_admin", "resident"), controller.getFlatsByFlatAdmin);
router.get("/apartment/:apartmentId/floors", auth, role("apartment_admin"), controller.getAllFloorByApartment);
router.get("/apartment/:apartmentId/floor/:floor", auth, role("apartment_admin"), controller.getAllFlatsByApartmentFloor);
router.get("/flat/:id", auth, role("apartment_admin"), controller.getFlatById);
router.get("/flat-members/:flatId", auth, role("apartment_admin"), controller.getFlatMembersByFlatAdminID);


module.exports = router;