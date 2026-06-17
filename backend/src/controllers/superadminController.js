const Store = require('../models/Store');
const User = require('../models/User');
const Product = require('../models/Product');
const Bill = require('../models/Bill');

// @desc    Get all stores with stats
// @route   GET /api/superadmin/stores
// @access  Private/SuperAdmin
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().lean();
    
    // For each store, get the admin user and user count
    const storesWithStats = await Promise.all(stores.map(async (store) => {
      const users = await User.find({ storeId: store._id });
      const admin = users.find(u => u.role === 'admin' || u.role === 'superadmin');
      
      return {
        ...store,
        adminName: admin ? admin.name : 'Unknown',
        adminEmail: admin ? admin.email : 'Unknown',
        userCount: users.length
      };
    }));

    res.status(200).json(storesWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update store status
// @route   PUT /api/superadmin/stores/:id/status
// @access  Private/SuperAdmin
exports.updateStoreStatus = async (req, res) => {
  try {
    // For now we will just use subscriptionPlan as a pseudo-status
    // e.g., 'free', 'suspended'
    const { status } = req.body;
    
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { subscriptionPlan: status },
      { new: true }
    );
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete store and all associated data
// @route   DELETE /api/superadmin/stores/:id
// @access  Private/SuperAdmin
exports.deleteStore = async (req, res) => {
  try {
    const storeId = req.params.id;

    // Make sure store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Delete all associated data
    await Promise.all([
      User.deleteMany({ storeId }),
      Product.deleteMany({ storeId }),
      Bill.deleteMany({ storeId }),
      Store.findByIdAndDelete(storeId)
    ]);

    res.status(200).json({ message: 'Store and all associated data permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset store admin password
// @route   PUT /api/superadmin/stores/:id/reset-password
// @access  Private/SuperAdmin
exports.resetAdminPassword = async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Please provide a new password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Find the admin user for this store
    const user = await User.findOneAndUpdate(
      { storeId: req.params.id, role: 'admin' },
      { password: hashedPassword }
    );

    if (!user) {
      return res.status(404).json({ message: 'Admin not found for this store' });
    }
    res.status(200).json({ message: 'Admin password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update store details
// @route   PUT /api/superadmin/stores/:id
// @access  Private/SuperAdmin
exports.updateStoreDetails = async (req, res) => {
  try {
    const { name, adminName, phone } = req.body;
    
    // Update store (name and phone)
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { name, phone },
      { new: true }
    );
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Update admin user (name)
    if (adminName) {
      await User.findOneAndUpdate(
        { storeId: req.params.id, role: 'admin' },
        { name: adminName }
      );
    }

    res.status(200).json({ message: 'Store details updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/superadmin/dashboard-stats
// @access  Private/SuperAdmin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    const stores = await Store.find({}, 'subscriptionPlan createdAt name');
    
    const planDistribution = stores.reduce((acc, store) => {
      const plan = store.subscriptionPlan || 'free';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {});
    
    const distributionArray = Object.keys(planDistribution).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: planDistribution[key]
    }));

    const recentSignups = stores.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const bills = await Bill.find({ createdAt: { $gte: sevenDaysAgo } }, 'createdAt storeId');
    
    const activeStoreIds = [...new Set(bills.map(b => b.storeId?.toString()))].filter(Boolean);
    const churnRiskStores = stores.filter(store => !activeStoreIds.includes(store._id.toString()));
    
    const activityMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      activityMap[dateStr] = 0;
    }
    
    bills.forEach(bill => {
      const dateStr = new Date(bill.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (activityMap[dateStr] !== undefined) {
        activityMap[dateStr]++;
      }
    });

    const platformActivity = Object.keys(activityMap).map(date => ({
      date,
      bills: activityMap[date]
    }));

    res.status(200).json({
      totalUsers,
      planDistribution: distributionArray,
      recentSignups,
      platformActivity,
      churnRiskStores
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
