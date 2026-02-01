const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
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

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  vehicleType: {
    type: String,
    enum: ["2W", "4W"],
    required: true
  },

  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true
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


vehicleSchema.index({ apartmentId: 1 });
vehicleSchema.index({ flatId: 1 });
vehicleSchema.index({ userId: 1 });


module.exports = mongoose.model("Vehicle", vehicleSchema);