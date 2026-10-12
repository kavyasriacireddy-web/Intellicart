const axios = require('axios');
const Product = require('../models/Product');
const Interaction = require('../models/Interaction');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

// Graceful fallback to trending/popular products from MongoDB
const getFallbackPopularProducts = async (limit = 8, categoryName = null) => {
  try {
    const query = { stock: { $gt: 0 } };
    if (categoryName) {
      query.categoryName = new RegExp(`^${categoryName}$`, 'i');
    }

    const products = await Product.find(query)
      .sort({ rating: -1, numReviews: -1, createdAt: -1 })
      .limit(limit)
      .populate('category', 'name slug');

    return products.map((p) => ({
      productId: p._id.toString(),
      name: p.name,
      categoryName: p.categoryName,
      brand: p.brand,
      finalPrice: p.finalPrice,
      price: p.price,
      rating: p.rating,
      images: p.images,
      score: 0.88,
      reason: 'Trending on IntelliCart',
    }));
  } catch (error) {
    console.error('[FallbackRecommender] Error fetching fallback products:', error.message);
    return [];
  }
};

// Fetch personalized recommendations for a user from AI service with fallback
const getRecommendationsForUser = async (userId, limit = 8) => {
  try {
    const url = `${AI_SERVICE_URL}/recommendations/user/${userId}?limit=${limit}`;
    const response = await axios.get(url, { timeout: 3500 });

    if (
      response.data &&
      response.data.success &&
      Array.isArray(response.data.recommendations) &&
      response.data.recommendations.length > 0
    ) {
      return {
        source: 'AI_HYBRID_ENGINE',
        recommendations: response.data.recommendations,
      };
    }

    // If AI service returned empty, use fallback
    const fallback = await getFallbackPopularProducts(limit);
    return { source: 'POPULARITY_FALLBACK', recommendations: fallback };
  } catch (error) {
    console.warn(`[AI Service Notice] AI service unreachable (${error.message}). Gracefully using MongoDB fallback.`);
    const fallback = await getFallbackPopularProducts(limit);
    return { source: 'DATABASE_FALLBACK', recommendations: fallback };
  }
};

// Fetch similar products for a product from AI service with fallback
const getSimilarProducts = async (productId, limit = 6) => {
  try {
    const url = `${AI_SERVICE_URL}/recommendations/product/${productId}?limit=${limit}`;
    const response = await axios.get(url, { timeout: 3500 });

    if (
      response.data &&
      response.data.success &&
      Array.isArray(response.data.recommendations) &&
      response.data.recommendations.length > 0
    ) {
      return {
        source: 'AI_TFIDF_ENGINE',
        recommendations: response.data.recommendations,
      };
    }

    // Fallback: Find products in the same category
    const product = await Product.findById(productId);
    const categoryName = product ? product.categoryName : null;
    const fallback = await getFallbackPopularProducts(limit, categoryName);
    return {
      source: 'CATEGORY_FALLBACK',
      recommendations: fallback.filter((p) => p.productId !== productId),
    };
  } catch (error) {
    console.warn(`[AI Service Notice] AI service unreachable for similar items (${error.message}). Using category fallback.`);
    const product = await Product.findById(productId);
    const categoryName = product ? product.categoryName : null;
    const fallback = await getFallbackPopularProducts(limit, categoryName);
    return {
      source: 'DATABASE_FALLBACK',
      recommendations: fallback.filter((p) => p.productId !== productId),
    };
  }
};

// Trigger AI retraining
const triggerRetraining = async () => {
  try {
    const url = `${AI_SERVICE_URL}/recommendations/train`;
    const response = await axios.post(url, {}, { timeout: 15000 });
    return response.data;
  } catch (error) {
    console.error('[AI Retrain] Error triggering retraining:', error.message);
    throw new Error(`AI service retrain failed: ${error.message}`);
  }
};

module.exports = {
  getRecommendationsForUser,
  getSimilarProducts,
  getFallbackPopularProducts,
  triggerRetraining,
};
