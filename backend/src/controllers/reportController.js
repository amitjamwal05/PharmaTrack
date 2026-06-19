const Bill = require('../models/Bill');
const Product = require('../models/Product');

// @desc    Get sales report
// @route   GET /api/reports/sales
// @access  Private
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { storeId: req.user.storeId };

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      query.createdAt = {
        $gte: start,
        $lte: end
      };
    }

    const bills = await Bill.find(query).populate('userId', 'name').sort('-createdAt');
    
    let totalSales = 0;
    let totalGst = 0;
    let totalProfit = 0;
    
    bills.forEach(bill => {
      totalSales += bill.totalAmount;
      totalGst += bill.totalGst;
      
      // Calculate profit: sum of ((sellingPrice - purchasePrice) * quantity)
      let billCost = 0;
      let billRevenueWithoutGst = 0;
      
      bill.items.forEach(item => {
        billCost += (item.purchasePrice || 0) * item.quantity;
        billRevenueWithoutGst += item.sellingPrice * item.quantity;
      });
      
      // Account for bill-level discount (which reduces profit)
      const discount = bill.discountAmount || 0;
      const profitForBill = billRevenueWithoutGst - billCost - discount;
      totalProfit += profitForBill;
    });

    res.status(200).json({
      totalBills: bills.length,
      totalSales,
      totalGst,
      totalProfit,
      bills
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stock value report
// @route   GET /api/reports/stock
// @access  Private
exports.getStockReport = async (req, res) => {
  try {
    const products = await Product.find({ storeId: req.user.storeId });
    
    let totalStockValue = 0;
    let totalItems = 0;
    
    products.forEach(product => {
      // Stock value = quantity * purchasePrice (fallback to selling price if purchase is not set)
      const price = product.purchasePrice || product.sellingPrice || product.price || 0;
      const qty = product.quantity || 0;
      totalStockValue += qty * price;
      totalItems += qty;
    });

    res.status(200).json({
      totalUniqueProducts: products.length,
      totalItems,
      totalStockValue,
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expiry report
// @route   GET /api/reports/expiry
// @access  Private
exports.getExpiryReport = async (req, res) => {
  try {
    const today = new Date();
    
    // Expired
    const expired = await Product.find({
      storeId: req.user.storeId,
      quantity: { $gt: 0 },
      expiryDate: { $lt: today },
    }).sort('expiryDate');

    // Expiring within 30 days
    const thirtyDays = new Date();
    thirtyDays.setDate(today.getDate() + 30);
    const expiringSoon = await Product.find({
      storeId: req.user.storeId,
      quantity: { $gt: 0 },
      expiryDate: { $gte: today, $lte: thirtyDays },
    }).sort('expiryDate');

    res.status(200).json({
      expiredCount: expired.length,
      expiringSoonCount: expiringSoon.length,
      expired,
      expiringSoon
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
