const PushToken = require('../models/push-token.model');

// Save / Update FCM token
exports.savePushToken = async (req, res) => {
  try {
    const { token, platform } = req.body;

    if (!token || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Token and platform are required'
      });
    }

    const payload = {
      userId: req.user._id,
      apartmentId: req.user.apartmentId,
      role: req.user.role,
      platform,
      token,
      isActive: true
    };

    // 🔁 Upsert token
    await PushToken.findOneAndUpdate(
      { token },
      payload,
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: 'Push token saved successfully'
    });

  } catch (error) {
    console.error('Save Push Token Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
