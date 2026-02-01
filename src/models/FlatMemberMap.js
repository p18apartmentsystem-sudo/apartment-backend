const mongoose = require("mongoose");

const flatMemberMapSchema = new mongoose.Schema({
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
  isActive: {
    type: Boolean,
    default: true
  },
  joinedAt: {
    type: String,
    required: true
  },
  leftAt: {
    type: String,
    default: null
  }
});


flatMemberMapSchema.index({ flatId: 1, isActive: 1 });
flatMemberMapSchema.index({ userId: 1, isActive: 1 });


module.exports = mongoose.model("FlatMemberMap", flatMemberMapSchema);