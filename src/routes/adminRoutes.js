const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const adminController = require("../controllers/adminController");

// 🔐 SUPER ADMIN ONLY

// Create admin
router.post(
  "/add-admin",
  auth,
  role("super_admin"),
  adminController.addAdmin
);

// 1️⃣ Get all admins (DESC)
router.get(
  "/admins",
  auth,
  role("super_admin"),
  adminController.getAllAdmins
);

// 2️⃣ Get admin by ID
router.get(
  "/admin/:id",
  auth,
  role("super_admin"),
  adminController.getAdminById
);

// 3️⃣ Update admin by ID
router.put(
  "/admin/:id",
  auth,
  role("super_admin"),
  adminController.updateAdminById
);

// 4️⃣ Delete admin (soft delete)
router.delete(
  "/admin/:id",
  auth,
  role("super_admin"),
  adminController.deleteAdminById
);

module.exports = router;
