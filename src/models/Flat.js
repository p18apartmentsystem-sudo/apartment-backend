const mongoose = require("mongoose");

const flatSchema = new mongoose.Schema({
  apartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Apartment",
    required: true
  },

  flatNumber: {
    type: String,
    required: true
  },

  floor: {
    type: Number,
    required: true
  },

  meterNumber: {
    type: Number,
    default: null
  },

  rentAmount: {
    type: Number,
    required: true
  },

  flatAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  isOccupied: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: String,
    required: true
  },

  updatedAt: {
    type: String,
    default: null
  },

  isActive: {
    type: Boolean,
    default: false
  },


});

module.exports = mongoose.model("Flat", flatSchema);