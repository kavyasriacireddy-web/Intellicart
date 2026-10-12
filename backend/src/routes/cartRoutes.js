const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All cart routes require authentication

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/', clearCart);
router.put('/:productId', updateCartItemQuantity);
router.delete('/:productId', removeFromCart);

module.exports = router;
