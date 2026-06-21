const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ storeId: req.user.storeId });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, storeId: req.user.storeId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const StockHistory = require('../models/StockHistory');

// @desc    Create product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    const storePlan = req.user.storeId?.subscriptionPlan;
    
    // Limit free plan to exactly 1 product
    if (!storePlan || storePlan === 'free' || storePlan === 'pending') {
      const productCount = await Product.countDocuments({ storeId: req.user.storeId });
      if (productCount >= 1) {
        return res.status(403).json({ message: 'PAYWALL_LIMIT_REACHED' });
      }
    }

    const product = new Product({
      ...req.body,
      storeId: req.user.storeId,
    });
    const createdProduct = await product.save();

    // Log initial stock if quantity is greater than 0
    if (createdProduct.stock > 0) {
      await StockHistory.create({
        storeId: req.user.storeId,
        productId: createdProduct._id,
        quantityChange: createdProduct.stock,
        reason: 'restock', // using 'restock' so dashboard picks it up
        notes: 'Initial stock on product creation',
        performedBy: req.user._id,
      });
    }

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, storeId: req.user.storeId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, storeId: req.user.storeId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expiring products
// @route   GET /api/products/expiring
// @access  Private
exports.getExpiringProducts = async (req, res) => {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 90); // 90 days from now

    const products = await Product.find({
      storeId: req.user.storeId,
      expiryDate: { $lte: futureDate },
    }).sort('expiryDate');

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      storeId: req.user.storeId,
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
    }).sort('quantity');

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
