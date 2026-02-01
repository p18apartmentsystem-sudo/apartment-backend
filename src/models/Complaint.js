const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
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

  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  category: {
    type: String,
    enum: ["water", "electricity", "parking", "lift", "noise", "other"],
    required: true
  },

  description: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["open", "in_progress", "resolved"],
    default: "open"
  },

  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  resolvedAt: {
    type: String,
    required: true
  },

  createdAt: {
    type: String,
    required: true
  }
});


complaintSchema.index({ apartmentId: 1, status: 1 });
complaintSchema.index({ flatId: 1 });
complaintSchema.index({ raisedBy: 1 });


module.exports = mongoose.model("Complaint", complaintSchema);