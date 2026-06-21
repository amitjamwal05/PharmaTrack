const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password').populate('storeId', 'name subscriptionPlan subscriptionExpiry');
      
      const settings = await SystemSettings.findOne();
      if (settings && settings.maintenanceMode && req.user.role !== 'superadmin') {
        return res.status(503).json({ message: 'MAINTENANCE_MODE' });
      }

      // Automatically flag as expired if the expiry date has passed
      if (req.user.storeId && req.user.storeId.subscriptionExpiry) {
        if (new Date() > new Date(req.user.storeId.subscriptionExpiry)) {
          req.user.storeId.subscriptionPlan = 'expired';
        }
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
