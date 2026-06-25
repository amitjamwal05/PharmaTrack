const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  addStaff,
  getStaff,
  deleteStaff,
  resetStaffPassword,
  sendOtp,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/send-otp', sendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Staff management routes
router.post('/staff', protect, authorize('admin', 'manager'), addStaff);
router.get('/staff', protect, authorize('admin', 'manager'), getStaff);
router.delete('/staff/:id', protect, authorize('admin', 'manager'), deleteStaff);
router.put('/staff/:id/reset-password', protect, authorize('admin', 'manager'), resetStaffPassword);

module.exports = router;
