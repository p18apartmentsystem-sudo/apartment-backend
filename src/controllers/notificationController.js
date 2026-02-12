const admin = require('../config/firebase');
const PushToken = require('../models/push-token.model');

// 🔔 Send notification to ENTIRE APARTMENT
exports.sendToApartment = async (req, res) => {
  try {
    const { apartmentId, title, body, data } = req.body;

    if (!apartmentId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'apartmentId, title and body are required',
      });
    }

    // Get all active tokens of apartment
    const tokens = await PushToken.find({
      apartmentId,
      isActive: true,
    });

    if (!tokens.length) {
      return res.status(404).json({
        success: false,
        message: 'No active tokens found',
      });
    }

    const fcmTokens = tokens.map(t => t.token);

    const message = {
      tokens: fcmTokens,
      notification: {
        title,
        body,
      },
      data: data || {},
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // Disable invalid tokens
    response.responses.forEach(async (resp, index) => {
      if (!resp.success) {
        await PushToken.updateOne(
          { token: fcmTokens[index] },
          { isActive: false }
        );
      }
    });

    return res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });

  } catch (error) {
    console.error('Send Apartment Notification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// 🔔 Send notification to SINGLE USER
exports.sendToUser = async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'userId, title and body are required',
      });
    }

    const tokens = await PushToken.find({
      userId,
      isActive: true,
    });

    if (!tokens.length) {
      return res.status(404).json({
        success: false,
        message: 'No active tokens found',
      });
    }

    const fcmTokens = tokens.map(t => t.token);

    const response = await admin.messaging().sendEachForMulticast({
      tokens: fcmTokens,
      notification: { title, body },
      data: data || {},
    });

    response.responses.forEach(async (resp, index) => {
      if (!resp.success) {
        await PushToken.updateOne(
          { token: fcmTokens[index] },
          { isActive: false }
        );
      }
    });

    return res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });

  } catch (error) {
    console.error('Send User Notification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
