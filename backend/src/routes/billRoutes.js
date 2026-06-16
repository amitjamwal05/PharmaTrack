const express = require('express');
const router = express.Router();
const {
  createBill,
  getBills,
  getBill,
  getPublicBill,
} = require('../controllers/billController');
const { protect } = require('../middleware/auth');

// Public route for digital receipts
router.route('/public/:id').get(getPublicBill);

router.use(protect);

router.route('/').post(createBill).get(getBills);
router.route('/:id').get(getBill);

module.exports = router;
