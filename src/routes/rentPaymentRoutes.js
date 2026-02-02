const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadRent");
const controller = require("../controllers/rentPaymentController");

// upload rent (flat_admin)
router.post(
  "/",
  auth,
  role("flat_admin"),
  upload.single("proofFile"),
  controller.addRentPayment
);

// get rent payments of flat (flat_admin)
router.get(
  "/flat",
  auth,
  role("flat_admin", "resident"),
  controller.getFlatRentPayments
);

// verify / reject rent (apartment_admin)
router.put(
  "/verify/:id",
  auth,
  role("apartment_admin"),
  controller.verifyRent
);

// view all rent payments (apartment_admin)
router.get(
  "/apartment/:apartmentId",
  auth,
  role("apartment_admin"),
  controller.getApartmentRentPayments
);

// view single rent proof (apartment_admin)
router.get(
  "/:id",
  auth,
  role("apartment_admin", "flat_admin", "resident"),
  controller.getRentPaymentById
);

module.exports = router;