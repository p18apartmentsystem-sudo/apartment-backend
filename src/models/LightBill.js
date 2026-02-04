const mongoose = require("mongoose");

const lightBillSchema = new mongoose.Schema({
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

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // flat_admin
    required: true
  },

  month: {
    type: String, // Jan-Dec
    required: true
  },

  year: {
    type: Number,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  billFile: {
    type: String, // path
    required: true
  },

  status: {
    type: String,
    enum: ["uploaded", "paid", "rejected"],
    default: "uploaded"
  },

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  createdAt: {
    type: String,
    required: true
  }
});


lightBillSchema.index({ apartmentId: 1, month: 1, year: 1 });
lightBillSchema.index({ apartmentId: 1, status: 1 });
lightBillSchema.index({ flatId: 1 });


module.exports = mongoose.model("LightBill", lightBillSchema);