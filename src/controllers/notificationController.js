const admin = require('../config/firebase');
const PushToken = require('../models/push-token.model');


// 🔔 Send notification to SINGLE USER (MOBILE ONLY)
exports.sendToUser = async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'userId, title and body are required'
      });
    }

    // 🔥 Only MOBILE tokens
    const pushTokens = await PushToken.find({
      userId,
      isActive: true,
      platform: { $in: ['android', 'ios'] }
    });

    if (!pushTokens.length) {
      return res.status(404).json({
        success: false,
        message: 'No active mobile tokens found'
      });
    }

    const tokens = pushTokens.map(t => t.token);

    // ✅ DATA ONLY MESSAGE (IMPORTANT)
    const message = {
      tokens,
      data: {
        title,
        body,
        route: data?.route || '/dashboard'
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // 🔥 Disable invalid tokens
    response.responses.forEach(async (resp, index) => {
      if (!resp.success) {
        await PushToken.updateOne(
          { token: tokens[index] },
          { isActive: false }
        );
      }
    });

    return res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error('Send Notification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};



// 🔔 Send notification to ENTIRE APARTMENT (MOBILE ONLY)
exports.sendToApartment = async (req, res) => {
  try {
    const { apartmentId, title, body, data } = req.body;

    if (!apartmentId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'apartmentId, title and body are required'
      });
    }

    const tokensData = await PushToken.find({
      apartmentId,
      isActive: true,
      platform: { $in: ['android', 'ios'] }
    });

    if (!tokensData.length) {
      return res.status(404).json({
        success: false,
        message: 'No active mobile tokens found'
      });
    }

    const tokens = tokensData.map(t => t.token);

    const message = {
      tokens,
      data: {
        title,
        body,
        route: data?.route || '/dashboard'
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    response.responses.forEach(async (resp, index) => {
      if (!resp.success) {
        await PushToken.updateOne(
          { token: tokens[index] },
          { isActive: false }
        );
      }
    });

    return res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error('Send Apartment Notification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
