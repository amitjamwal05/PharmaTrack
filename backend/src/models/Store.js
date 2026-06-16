const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    gstNumber: {
      type: String,
    },
    logo: {
      type: String, // URL
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'basic', 'pro'],
      default: 'free',
    },
    subscriptionExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Store', storeSchema);
