const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  address_lg: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
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
    default: true
  },
});

module.exports = mongoose.model("Apartment", apartmentSchema);