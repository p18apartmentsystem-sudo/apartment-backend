const mongoose = require("mongoose");

const rentPaymentSchema = new mongoose.Schema({
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

  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // flat_admin
    required: true
  },

  month: {
    type: String, // Jan - Dec
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

  refno: {
    type: String, // Jan - Dec
    required: true
  },
  
  proofFile: {
    type: String, // file path
    required: true
  },

  status: {
    type: String,
    enum: ["paid", "verified", "rejected"],
    default: "paid"
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


rentPaymentSchema.index({ apartmentId: 1, month: 1, year: 1 });
rentPaymentSchema.index({ apartmentId: 1, status: 1 });
rentPaymentSchema.index({ flatId: 1 });


module.exports = mongoose.model("RentPayment", rentPaymentSchema);