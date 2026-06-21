const Bill = require('../models/Bill');
const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');

// Helper to generate bill number
const generateBillNumber = async () => {
  const count = await Bill.countDocuments();
  return `BILL-${Date.now().toString().slice(-6)}-${count + 1}`;
};

// @desc    Create new bill
// @route   POST /api/bills
// @access  Private
exports.createBill = async (req, res) => {
  try {
    const { items, customerName, customerPhone, paymentMethod, discountAmount = 0 } = req.body;

    const storePlan = req.user.storeId?.subscriptionPlan;
    if (!storePlan || storePlan === 'free' || storePlan === 'pending') {
      const billCount = await Bill.countDocuments({ storeId: req.user.storeId });
      if (billCount >= 5) {
        return res.status(403).json({ message: 'PAYWALL_TRIGGERED' });
      }
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in bill' });
    }

    let subtotal = 0;
    let totalGst = 0;
    const processedItems = [];

    // Process each item and reduce stock
    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, storeId: req.user.storeId });
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.productName}` });
      }

      // Calculate prices
      const actualSellingPrice = product.sellingPrice || product.price || 0;
      const itemTotal = actualSellingPrice * item.quantity;
      const itemGst = (itemTotal * (product.gstRate || 0)) / 100;
      
      subtotal += itemTotal;
      totalGst += itemGst;

      processedItems.push({
        productId: product._id,
        productName: product.productName,
        batchNumber: product.batchNumber,
        quantity: item.quantity,
        purchasePrice: product.purchasePrice || 0,
        sellingPrice: actualSellingPrice,
        discount: 0, // Item level discount could be added
        gstAmount: itemGst,
        total: itemTotal + itemGst,
      });

      // Update stock
      const previousQuantity = product.quantity;
      await Product.updateOne(
        { _id: product._id },
        { $inc: { quantity: -item.quantity } },
        { runValidators: false }
      );

      // Record stock history but we need billId, we'll do it after bill creation
    }

    const totalAmount = subtotal + totalGst - discountAmount;
    const billNumber = await generateBillNumber();

    const bill = await Bill.create({
      billNumber,
      customerName,
      customerPhone,
      items: processedItems,
      subtotal,
      discountAmount,
      totalGst,
      totalAmount,
      paymentMethod,
      userId: req.user._id,
      storeId: req.user.storeId,
    });

    // Create stock history records
    for (const item of processedItems) {
      await StockHistory.create({
        productId: item.productId,
        previousQuantity: item.quantity + (await Product.findById(item.productId)).quantity, // roughly correct for history
        newQuantity: (await Product.findById(item.productId)).quantity,
        quantityChange: -item.quantity,
        reason: 'sale',
        referenceId: bill._id,
        userId: req.user._id,
        storeId: req.user.storeId,
      });
    }

    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find({ storeId: req.user.storeId })
      .populate('userId', 'name')
      .sort('-createdAt');
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single bill
// @route   GET /api/bills/:id
// @access  Private
exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, storeId: req.user.storeId })
      .populate('userId', 'name');
      
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    res.status(200).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single bill publicly (no auth required)
// @route   GET /api/bills/public/:id
// @access  Public
exports.getPublicBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id })
      .populate('storeId', 'name address phone gstNumber logo')
      .populate('userId', 'name');
      
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    res.status(200).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
