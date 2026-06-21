const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getExpiringProducts,
  getLowStockProducts,
  getRecentUpdates,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/recent-updates', getRecentUpdates);
router.get('/expiring', getExpiringProducts);
router.get('/low-stock', getLowStockProducts);

router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(getProduct).put(updateProduct).delete(deleteProduct);

module.exports = router;
