const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      default: null
    },

    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      default: null
    },

    itemName: {
      type: String,
      trim: true
    },

    quantity: {
      type: Number,
      min: 0
    },

    description: {
      type: String,
      default: ""
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    addedAt: {
      type: String,
      default:null
    }

  },
);

module.exports = mongoose.model("Inventory", inventorySchema);
