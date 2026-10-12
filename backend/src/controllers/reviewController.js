const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Interaction = require('../models/Interaction');

// Helper to recalculate and persist average rating and review count
const updateProductRatingStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0,
    });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new verified review
// @route   POST /api/reviews/product/:productId
// @access  Private
const createProductReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide rating and comment' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 1. Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product. You can edit your existing review.',
      });
    }

    // 2. Strict Verification: Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
      orderStatus: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
    });

    if (!hasPurchased && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Verified Buyers Only: You can only review products you have purchased.',
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      title: title || '',
      comment,
      isVerifiedPurchase: Boolean(hasPurchased),
    });

    // 3. Recalculate average rating
    await updateProductRatingStats(product._id);

    // 4. Log RATING and REVIEW interaction telemetry for AI Recommender
    await Interaction.create({
      userId: req.user._id,
      productId: product._id,
      action: 'RATING',
      weight: Number(rating),
      metadata: { rating: Number(rating), verified: Boolean(hasPurchased) },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
    }

    if (rating) review.rating = Number(rating);
    if (title !== undefined) review.title = title;
    if (comment) review.comment = comment;

    await review.save();
    await updateProductRatingStats(review.product);

    res.status(200).json({ success: true, message: 'Review updated successfully', review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductRatingStats(productId);

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createProductReview,
  updateReview,
  deleteReview,
};
