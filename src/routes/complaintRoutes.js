const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/complaintController");

// raise complaint (resident / flat_admin)
router.post(
  "/",
  auth,
  role("resident", "flat_admin"),
  controller.raiseComplaint
);

// get complaints of flat (flat_admin)
router.get(
  "/flat",
  auth,
  role("flat_admin"),
  controller.getFlatComplaints
);

// get my complaints (resident)
router.get(
  "/my",
  auth,
  role("resident"),
  controller.getMyComplaints
);

// update complaint status (apartment_admin)
router.put(
  "/status/:id",
  auth,
  role("apartment_admin"),
  controller.updateComplaintStatus
);

module.exports = router;