const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/paymentController");


//PATH:: /payment....
router.get("/flats", auth, role("apartment_admin"), controller.getFlatPayments);
router.post("/bulk-light-paid", auth, role("apartment_admin"), controller.bulkLightBillPaid);
router.post("/bulk-rent-paid", auth, role("apartment_admin"), controller.bulkRentPaid);
router.post("/single-paid", auth, role("apartment_admin"), controller.markPaymentPaid);

module.exports = router;