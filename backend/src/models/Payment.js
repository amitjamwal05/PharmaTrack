const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  planId: {
    type: String,
    enum: ['monthly', 'quarterly', 'annually'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'success'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
