const {
  getRecommendationsForUser,
  getSimilarProducts,
  getFallbackPopularProducts,
  triggerRetraining,
} = require('../services/aiRecommendationService');

// @desc    Get recommendations for the current user or guest
// @route   GET /api/recommendations
// @access  Public (Optional authentication)
const getRecommendations = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const userId = req.user ? req.user._id.toString() : null;

    if (!userId) {
      // Unauthenticated visitor -> return popular/trending
      const fallback = await getFallbackPopularProducts(limit);
      return res.status(200).json({
        success: true,
        source: 'COLD_START_POPULARITY',
        recommendations: fallback,
      });
    }

    const result = await getRecommendationsForUser(userId, limit);
    res.status(200).json({
      success: true,
      source: result.source,
      recommendations: result.recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get similar products for a specific item (Content-Based)
// @route   GET /api/recommendations/product/:productId
// @access  Public
const getProductSimilarRecommendations = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 6;

    const result = await getSimilarProducts(productId, limit);
    res.status(200).json({
      success: true,
      source: result.source,
      recommendations: result.recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger AI engine retraining (Admin only)
// @route   POST /api/recommendations/train
// @access  Private/Admin
const trainRecommendationEngine = async (req, res, next) => {
  try {
    const result = await triggerRetraining();
    res.status(200).json({
      success: true,
      message: 'AI recommendation retraining triggered successfully',
      result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  getProductSimilarRecommendations,
  trainRecommendationEngine,
};
