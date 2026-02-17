const admin = require('../config/firebase');
const PushToken = require('../models/push-token.model');

// 🔥 Internal helper
async function sendToTokens(tokens, title, body, route = '/') {
    if (!tokens.length) return;

    const message = {
        tokens,
        data: {
            title: String(title),
            body: String(body),
            route: String(route)
        }
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // Disable invalid tokens
    response.responses.forEach(async (resp, index) => {
        if (!resp.success) {
            await PushToken.updateOne(
                { token: tokens[index] },
                { isActive: false }
            );
        }
    });
}

/**
 * 🏢 Flat → Apartment Admin
 * When complaint raised
 */
exports.flatToApartment = async (apartmentId, title, body, route) => {
    const tokens = await PushToken.find({
        apartmentId,
        role: 'apartment_admin',
        isActive: true,
        platform: { $in: ['android', 'ios'] }
    });

    const tokenList = tokens.map(t => t.token);
    await sendToTokens(tokenList, title, body, route);
};

/**
 * 🏢 Apartment → Flat User
 * When complaint resolved
 */
exports.apartmentToFlat = async (userId, title, body, route) => {
    const tokens = await PushToken.find({
        userId,
        isActive: true,
        platform: { $in: ['android', 'ios'] }
    });

    const tokenList = tokens.map(t => t.token);
    await sendToTokens(tokenList, title, body, route);
};

/**
 * 🏢 Apartment → All Members
 * Broadcast by apartment admin
 */
exports.apartmentToApartment = async (apartmentId, title, body, route) => {
    const tokens = await PushToken.find({
        apartmentId,
        isActive: true,
        platform: { $in: ['android', 'ios'] }
    });

    const tokenList = tokens.map(t => t.token);
    await sendToTokens(tokenList, title, body, route);
};
