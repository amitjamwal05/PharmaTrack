const Razorpay = require('razorpay');
const crypto = require('crypto');
const Store = require('../models/Store');
const User = require('../models/User');
const Payment = require('../models/Payment');

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('⚠️ Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payment features will fail.');
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body; // 'monthly' or 'annually'
    
    let amount = 0;
    if (planId === 'monthly') amount = 3999;
    else if (planId === 'quarterly') amount = 8999;
    else if (planId === 'annually') amount = 19999;
    else if (planId === 'test') amount = 1; // 1 INR for testing
    else return res.status(400).json({ message: 'Invalid plan selected' });

    if (!razorpay) {
      return res.status(500).json({ message: 'Payment gateway is not configured on the server. Please add Razorpay keys to environment variables.' });
    }

    const user = await User.findById(req.user.id).populate('storeId');
    if (!user || !user.storeId) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      message: 'Failed to initiate payment', 
      error: error.message,
      stack: error.stack,
      razorpayError: error.error || error 
    });
  }
};

// @desc    Verify Razorpay Order and Update Subscription
// @route   POST /api/payments/verify
// @access  Private
exports.verifyOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Payment gateway is not configured on the server. Please add Razorpay keys to environment variables.' });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      // Update Store Subscription
      const store = await Store.findById(req.user.storeId);
      if (!store) return res.status(404).json({ message: 'Store not found' });

      store.subscriptionPlan = planId;
      
      const expiryDate = new Date();
      if (planId === 'monthly') {
        store.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      } else if (planId === 'quarterly') {
        store.subscriptionExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      } else if (planId === 'annually') {
        store.subscriptionExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      } else if (planId === 'test') {
        store.subscriptionExpiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 day for test
      }
      
      store.subscriptionExpiry = expiryDate;
      await store.save();

      let amountPaid = 0;
      if (planId === 'monthly') amountPaid = 3999;
      else if (planId === 'quarterly') amountPaid = 8999;
      else if (planId === 'annually') amountPaid = 19999;
      else if (planId === 'test') amountPaid = 1;

      await Payment.create({
        storeId: store._id,
        planId: planId,
        amount: amountPaid,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: 'success'
      });

      res.status(200).json({ message: 'Payment verified and subscription updated successfully', plan: planId });
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Error verifying Razorpay order:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};
