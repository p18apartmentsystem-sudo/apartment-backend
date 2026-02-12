const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// 🔔 Send to apartment (Admin)
router.post(
  '/send/apartment',
  authMiddleware,
  notificationController.sendToApartment
);

// 🔔 Send to single user
router.post(
  '/send/user',
  authMiddleware,
  notificationController.sendToUser
);

module.exports = router;
