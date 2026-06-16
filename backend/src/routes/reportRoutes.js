const express = require('express');
const router = express.Router();
const {
  getSalesReport,
  getStockReport,
  getExpiryReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/sales', getSalesReport);
router.get('/stock', getStockReport);
router.get('/expiry', getExpiryReport);

module.exports = router;
