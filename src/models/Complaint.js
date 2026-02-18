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
    default: null
  },

  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // 🔥 NEW FIELD
  type: {
    type: String,
    enum: ["complaint", "broadcast"],
    default: "complaint"
  },

  category: {
    type: String,
    enum: ["water", "electricity", "parking", "lift", "noise", "other"],
    default: "other"
  },

  title: {                 // 🔥 for broadcast
    type: String,
    default: null
  },

  description: {
    type: String,
    default: null
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
    type: Date,
    default: null
  },

  createdAt: {
    type: String,
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },

});

// Indexes
complaintSchema.index({ apartmentId: 1, status: 1 });
complaintSchema.index({ flatId: 1 });
complaintSchema.index({ raisedBy: 1 });
complaintSchema.index({ type: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);
