const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/profileController");

//PATH:: /profile...
router.get("/me", auth, controller.getProfile);
router.post("/send-email-otp", auth, controller.sendEmailOtp);
router.post("/verify-email-otp", auth, controller.verifyEmailOtp);
router.put("/me", auth, controller.updateMyProfile);


module.exports = router;