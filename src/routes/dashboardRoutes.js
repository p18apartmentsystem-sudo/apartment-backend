const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/dashboardController");

//super admin dashboard
router.get(
  '/super-admin',
  auth,
  role('super_admin'),
  controller.getSuperAdminDashboard
);


// flat dashboard
router.get(
    "/flat",
    auth,
    role("flat_admin", "resident"),
    controller.getFlatDashboard
);

// apartment dashboard
router.get(
  "/apartment",
  auth,
  role("apartment_admin"),
  controller.getApartmentDashboard
);


module.exports = router;