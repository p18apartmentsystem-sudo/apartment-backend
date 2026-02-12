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

        const userId = req.user.userId

        // 🔥 Disable old tokens for same user + platform
        await PushToken.updateMany(
            {
                userId,
                platform,
                token: { $ne: token }
            },
            { isActive: false }
        );

        const payload = {
            userId,
            apartmentId: req.user.apartmentId,
            role: req.user.role,
            platform,
            token,
            isActive: true
        };

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

// Disable token on logout
exports.disablePushToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        await PushToken.updateOne(
            { token },
            { isActive: false }
        );

        return res.json({
            success: true,
            message: 'Push token disabled successfully'
        });

    } catch (error) {
        console.error('Disable Push Token Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
