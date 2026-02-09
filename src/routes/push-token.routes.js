const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const pushTokenController = require('../controllers/push-token.controller');

// Save / Update FCM token
router.post(
  '/save',
  authMiddleware,
  pushTokenController.savePushToken
);

module.exports = router;
