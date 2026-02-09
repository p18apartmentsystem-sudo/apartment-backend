const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      required: true,
      index: true
    },

    role: {
      type: String,
      enum: ["super_admin", "apartment_admin", "flat_admin", "resident"],
      required: true
    },

    platform: {
      type: String,
      enum: ['web', 'android', 'ios'],
      required: true
    },

    token: {
      type: String,
      required: true,
      unique: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PushToken', pushTokenSchema);