const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
    },
    customerPhone: {
      type: String,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: String,
        batchNumber: String,
        quantity: Number,
        purchasePrice: {
          type: Number,
          default: 0
        },
        sellingPrice: Number,
        discount: Number,
        gstAmount: Number,
        total: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalGst: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'credit'],
      default: 'cash',
    },
    prescriptionImage: {
      type: String, // URL
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);
