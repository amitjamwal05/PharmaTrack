const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    reason: {
      type: String, // purchase, sale, damaged, expired, adjustment
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId, // billId if sale, purchaseOrderId if purchase
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

module.exports = mongoose.model('StockHistory', stockHistorySchema);
