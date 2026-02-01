const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    apartmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Apartment",
        required: true
    },

    flatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flat",
        default: null
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    type: {
        type: String,
        enum: [
            "RENT_UPLOADED",
            "RENT_VERIFIED",
            "LIGHT_BILL_UPLOADED",
            "COMPLAINT_RAISED",
            "COMPLAINT_RESOLVED"
        ],
        required: true
    },

    message: {
        type: String,
        required: true
    },

    isRead: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Notification", notificationSchema);