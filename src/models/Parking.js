const mongoose = require("mongoose");

const parkingSchema = new mongoose.Schema({
  apartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Apartment",
    required: true
  },

  flatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flat",
    required: true
  },

  slotNumber: {
    type: String,
    required: true
  },

  vehicleType: {
    type: String,
    enum: ["2_wheeler", "4_wheeler"],
    required: true
  },

  createdAt: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Parking", parkingSchema);