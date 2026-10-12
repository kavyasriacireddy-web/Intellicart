const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getProductSimilarRecommendations,
  trainRecommendationEngine,
} = require('../controllers/recommendationController');
const { protect, authorizeAdmin, optionalAuth } = require('../middleware/authMiddleware');

// Get personalized (or popular fallback) recommendations
router.get('/', optionalAuth, getRecommendations);

// Get content-based similar products
router.get('/product/:productId', getProductSimilarRecommendations);

// Trigger AI retraining (Admin only)
router.post('/train', protect, authorizeAdmin, trainRecommendationEngine);

module.exports = router;
