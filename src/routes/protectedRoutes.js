const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// only logged-in users
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Profile access granted",
    user: req.user
  });
});

// only admin & super_admin
router.get(
  "/admin-only",
  authMiddleware,
  roleMiddleware("admin", "super_admin"),
  (req, res) => {
    res.json({
      message: "Admin access granted"
    });
  }
);

// only super_admin
router.get(
  "/super-admin-only",
  authMiddleware,
  roleMiddleware("super_admin"),
  (req, res) => {
    res.json({
      message: "Super admin access granted"
    });
  }
);

module.exports = router;