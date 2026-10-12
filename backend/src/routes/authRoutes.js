const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserStatus,
} = require('../controllers/authController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Admin-only endpoints
router.get('/users', protect, authorizeAdmin, getAllUsers);
router.put('/users/:id', protect, authorizeAdmin, updateUserStatus);

module.exports = router;
