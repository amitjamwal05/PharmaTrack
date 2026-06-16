const express = require('express');
const router = express.Router();
const {
  addStock,
  adjustStock,
  getStockHistory,
} = require('../controllers/stockController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/add', addStock);
router.post('/adjust', adjustStock);
router.get('/history', getStockHistory);

module.exports = router;
