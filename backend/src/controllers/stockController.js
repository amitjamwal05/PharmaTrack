const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');

// @desc    Add stock to product
// @route   POST /api/stock/add
// @access  Private
exports.addStock = async (req, res) => {
  try {
    const { productId, quantityToAdd, newExpiryDate, batchNumber } = req.body;

    const product = await Product.findOne({ _id: productId, storeId: req.user.storeId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity + Number(quantityToAdd);

    // Update product
    product.quantity = newQuantity;
    if (newExpiryDate) product.expiryDate = newExpiryDate;
    if (batchNumber) product.batchNumber = batchNumber;
    await product.save();

    // Record history
    const history = await StockHistory.create({
      productId: product._id,
      previousQuantity,
      newQuantity,
      quantityChange: quantityToAdd,
      reason: 'purchase', // or 'addition'
      userId: req.user._id,
      storeId: req.user.storeId,
    });

    res.status(200).json({ product, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manual stock adjustment
// @route   POST /api/stock/adjust
// @access  Private
exports.adjustStock = async (req, res) => {
  try {
    const { productId, newQuantity, reason } = req.body;

    const product = await Product.findOne({ _id: productId, storeId: req.user.storeId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const previousQuantity = product.quantity;
    const quantityChange = newQuantity - previousQuantity;

    // Update product
    product.quantity = newQuantity;
    await product.save();

    // Record history
    const history = await StockHistory.create({
      productId: product._id,
      previousQuantity,
      newQuantity,
      quantityChange,
      reason, // damaged, expired, adjustment, etc.
      userId: req.user._id,
      storeId: req.user.storeId,
    });

    res.status(200).json({ product, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stock movement history
// @route   GET /api/stock/history
// @access  Private
exports.getStockHistory = async (req, res) => {
  try {
    const history = await StockHistory.find({ storeId: req.user.storeId })
      .populate('productId', 'productName batchNumber')
      .populate('userId', 'name')
      .sort('-createdAt');

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
