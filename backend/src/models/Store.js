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
      enum: ['free', 'monthly', 'quarterly', 'annually'],
      default: 'free',
    },
    subscriptionExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Store', storeSchema);
