const mongoose = require("mongoose");

const parkingAssignmentSchema = new mongoose.Schema({
  apartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Apartment",
    required: true
  },
  parkingSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingSlot",
    required: true
  },
  flatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flat",
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  assignedAt: {
    type: String,
    required: true
  },
  unassignedAt: {
    type: String,
    default: null
  }
});


parkingAssignmentSchema.index({ parkingSlotId: 1, isActive: 1 });
parkingAssignmentSchema.index({ flatId: 1, isActive: 1 });


module.exports = mongoose.model("ParkingAssignmentMap", parkingAssignmentSchema);