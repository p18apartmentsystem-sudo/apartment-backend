const mongoose = require("mongoose");

const parkingSlotSchema = new mongoose.Schema({
  apartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Apartment",
    required: true
  },
  side: {
    type: String,
    enum: ["LEFT", "RIGHT", "FRONT", "BACK"],
    required: true
  },
  name: {
    type: String,
    default: null
  },
  slotNumber: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("ParkingSlot", parkingSlotSchema);