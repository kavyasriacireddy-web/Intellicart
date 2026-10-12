const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductByIdentifier,
  getFeaturedProducts,
  getBrands,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/brands', getBrands);
router.get('/:identifier', getProductByIdentifier);

// Admin-only management
router.post('/', protect, authorizeAdmin, createProduct);
router.put('/:id', protect, authorizeAdmin, updateProduct);
router.delete('/:id', protect, authorizeAdmin, deleteProduct);

module.exports = router;
