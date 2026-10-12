const express = require('express');
const router = express.Router();
const {
  recordInteraction,
  getUserInteractions,
  getInteractionAnalytics,
  exportTrainingData,
} = require('../controllers/interactionController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

// Public export endpoint for AI service training data
router.get('/export', exportTrainingData);

// Protected routes
router.post('/', protect, recordInteraction);
router.get('/my', protect, getUserInteractions);
router.get('/analytics', protect, authorizeAdmin, getInteractionAnalytics);

module.exports = router;
