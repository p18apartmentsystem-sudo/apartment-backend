const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },

  mobile: {
    type: String,
    required: true,
    unique: true,
    match: [/^[6-9]\d{9}$/, "Invalid mobile number"]
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["super_admin", "apartment_admin", "flat_admin", "resident"],
    default: "resident"
  },

  apartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Apartment",
    default: null
  },

  flatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flat",
    default: null
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: String,
    required: true
  },

  updatedAt: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: String,
    default: null
  },
});

module.exports = mongoose.model("User", userSchema);