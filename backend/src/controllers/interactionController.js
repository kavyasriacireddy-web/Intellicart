const Interaction = require('../models/Interaction');
const Product = require('../models/Product');

// @desc    Record a user behavioral interaction
// @route   POST /api/interactions
// @access  Private (or optional guest if anonymous tracking is needed)
const recordInteraction = async (req, res, next) => {
  try {
    const { productId, action, metadata, weight } = req.body;

    const validActions = [
      'PRODUCT_VIEW',
      'SEARCH',
      'CATEGORY_VIEW',
      'WISHLIST',
      'ADD_TO_CART',
      'REMOVE_FROM_CART',
      'PURCHASE',
      'RATING',
      'REVIEW',
    ];

    if (!action || !validActions.includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid interaction action' });
    }

    // Require userId
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      // For unauthenticated views, do not pollute persistent user interaction matrix
      return res.status(200).json({ success: true, message: 'Guest interaction acknowledged' });
    }

    // Throttle duplicate PRODUCT_VIEW within 1 minute to avoid spamming
    if (action === 'PRODUCT_VIEW' && productId) {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentView = await Interaction.findOne({
        userId,
        productId,
        action: 'PRODUCT_VIEW',
        createdAt: { $gte: oneMinuteAgo },
      });
      if (recentView) {
        return res.status(200).json({ success: true, message: 'Recent view throttled' });
      }
    }

    const interaction = await Interaction.create({
      userId,
      productId: productId || null,
      action,
      metadata: metadata || {},
      weight: weight || undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Interaction recorded',
      interactionId: interaction._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's interaction history
// @route   GET /api/interactions/my
// @access  Private
const getUserInteractions = async (req, res, next) => {
  try {
    const interactions = await Interaction.find({ userId: req.user._id })
      .populate('productId', 'name images price finalPrice categoryName brand')
      .sort({ timestamp: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: interactions.length,
      interactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated interaction analytics (Admin)
// @route   GET /api/interactions/analytics
// @access  Private/Admin
const getInteractionAnalytics = async (req, res, next) => {
  try {
    const actionCounts = await Interaction.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const topViewedProducts = await Interaction.aggregate([
      { $match: { action: 'PRODUCT_VIEW', productId: { $ne: null } } },
      { $group: { _id: '$productId', viewCount: { $sum: 1 } } },
      { $sort: { viewCount: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          viewCount: 1,
          name: '$product.name',
          categoryName: '$product.categoryName',
          finalPrice: '$product.finalPrice',
          image: { $arrayElemAt: ['$product.images', 0] },
        },
      },
    ]);

    const topSearchedTerms = await Interaction.aggregate([
      { $match: { action: 'SEARCH', 'metadata.query': { $exists: true, $ne: '' } } },
      { $group: { _id: '$metadata.query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        actionCounts,
        topViewedProducts,
        topSearchedTerms,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export interaction and product data for AI model training
// @route   GET /api/interactions/export
// @access  Public (or protected via internal API secret)
const exportTrainingData = async (req, res, next) => {
  try {
    const products = await Product.find({}, 'name description categoryName subcategory brand tags specifications price rating stock');
    const interactions = await Interaction.find({}, 'userId productId action weight timestamp');

    res.status(200).json({
      success: true,
      products,
      interactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordInteraction,
  getUserInteractions,
  getInteractionAnalytics,
  exportTrainingData,
};
