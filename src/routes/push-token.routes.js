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


// Disable token on logout
router.post(
  '/disable',
  authMiddleware,
  pushTokenController.disablePushToken
);


module.exports = router;
