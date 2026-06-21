const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    genericName: {
      type: String,
    },
    category: {
      type: String,
      enum: [
        'Tablet',
        'Capsule',
        'Syrup',
        'Injection',
        'Ointment',
        'Drops',
        'Inhaler',
        'Vaccines',
        'Other',
      ],
    },
    manufacturer: {
      type: String,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    batchNumber: {
      type: String,
      required: true,
    },
    purchasePrice: {
      type: Number,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String, // strip, bottle, vial, box, etc.
    },
    reorderLevel: {
      type: Number,
      default: 10,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    rackNumber: {
      type: String,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    gstRate: {
      type: Number,
      default: 0,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
