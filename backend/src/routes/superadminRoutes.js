const express = require('express');
const router = express.Router();
const { getAllStores, updateStoreStatus, deleteStore, resetAdminPassword, getDashboardStats, updateStoreDetails } = require('../controllers/superadminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stores', protect, authorize('superadmin'), getAllStores);
router.get('/dashboard-stats', protect, authorize('superadmin'), getDashboardStats);
router.put('/stores/:id/status', protect, authorize('superadmin'), updateStoreStatus);
router.put('/stores/:id', protect, authorize('superadmin'), updateStoreDetails);
router.delete('/stores/:id', protect, authorize('superadmin'), deleteStore);
router.put('/stores/:id/reset-password', protect, authorize('superadmin'), resetAdminPassword);

module.exports = router;
