const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryByIdentifier,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.get('/:identifier', getCategoryByIdentifier);
router.post('/', protect, authorizeAdmin, createCategory);
router.put('/:id', protect, authorizeAdmin, updateCategory);
router.delete('/:id', protect, authorizeAdmin, deleteCategory);

module.exports = router;
