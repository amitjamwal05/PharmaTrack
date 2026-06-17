const express = require('express');
const router = express.Router();
const { getAllStores, updateStoreStatus, deleteStore, resetAdminPassword, getDashboardStats, updateStoreDetails, getSystemSettings, updateMaintenanceMode, updateSmtpConfig, testSmtpConfig, getDatabaseBackup } = require('../controllers/superadminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stores', protect, authorize('superadmin'), getAllStores);
router.get('/dashboard-stats', protect, authorize('superadmin'), getDashboardStats);
router.put('/stores/:id/status', protect, authorize('superadmin'), updateStoreStatus);
router.put('/stores/:id', protect, authorize('superadmin'), updateStoreDetails);
router.delete('/stores/:id', protect, authorize('superadmin'), deleteStore);
router.put('/stores/:id/reset-password', protect, authorize('superadmin'), resetAdminPassword);

router.get('/settings', protect, authorize('superadmin'), getSystemSettings);
router.put('/settings/maintenance', protect, authorize('superadmin'), updateMaintenanceMode);
router.put('/settings/smtp', protect, authorize('superadmin'), updateSmtpConfig);
router.post('/settings/smtp/test', protect, authorize('superadmin'), testSmtpConfig);
router.get('/backup', protect, authorize('superadmin'), getDatabaseBackup);

module.exports = router;
