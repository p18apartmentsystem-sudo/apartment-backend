const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/reportController");

router.get(
    "/flats",
    auth,
    role("apartment_admin"),
    controller.getFlatReport
);

router.get(
    "/rent",
    auth,
    role("apartment_admin"),
    controller.getRentReport
);

router.get(
    "/pending-payments",
    auth,
    role("apartment_admin"),
    controller.getPendingPayments
);

router.get(
    "/vehicles",
    auth,
    role("apartment_admin"),
    controller.getVehicleReport
);

router.get(
    "/complaints",
    auth,
    role("apartment_admin"),
    controller.getComplaintReport
);

router.get(
    "/vehicles/detailed",
    auth,
    role("apartment_admin"),
    controller.getVehicleReportDetailed
);

module.exports = router;