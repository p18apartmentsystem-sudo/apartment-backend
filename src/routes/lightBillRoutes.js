const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadLightBill");
const controller = require("../controllers/lightBillController");

// upload light bill (flat_admin)
router.post(
  "/",
  auth,
  role("flat_admin"),
  upload.single("billFile"),
  controller.uploadLightBill
);

// get bills of flat (flat_admin)
router.get(
  "/flat",
  auth,
  role("flat_admin"),
  controller.getFlatLightBills
);

// verify / reject bill (apartment_admin)
router.put(
  "/verify/:id",
  auth,
  role("apartment_admin"),
  controller.verifyLightBill
);

// view all light bill (apartment_admin)
router.get(
  "/apartment/:apartmentId",
  auth,
  role("apartment_admin"),
  controller.getApartmentLightBillPayments
);

// view single light bill proof (apartment_admin)
router.get(
  "/:id",
  auth,
  role("apartment_admin"),
  controller.getLightBillPaymentById
);


module.exports = router;