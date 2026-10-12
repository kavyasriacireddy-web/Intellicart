const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Interaction = require('../models/Interaction');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name finalPrice price discount images stock brand categoryName rating numReviews',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.status(200).json({
      success: true,
      count: wishlist.products.length,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    // Check if already in wishlist
    const exists = wishlist.products.some((id) => id.toString() === productId);
    if (!exists) {
      wishlist.products.push(productId);
      await wishlist.save();

      // Log interaction telemetry for collaborative filtering
      await Interaction.create({
        userId: req.user._id,
        productId,
        action: 'WISHLIST',
        weight: 3,
        metadata: { categoryName: product.categoryName },
      });
    }

    await wishlist.populate({
      path: 'products',
      select: 'name finalPrice price discount images stock brand categoryName rating numReviews',
    });

    res.status(200).json({
      success: true,
      message: exists ? 'Product is already in your wishlist' : 'Added to wishlist',
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      select: 'name finalPrice price discount images stock brand categoryName rating numReviews',
    });

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist',
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move item from wishlist to cart
// @route   POST /api/wishlist/:productId/move-to-cart
// @access  Private
const moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: 'Product is currently out of stock' });
    }

    // 1. Remove from wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
      await wishlist.save();
    }

    // 2. Add to cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({
        product: product._id,
        quantity: 1,
        price: product.finalPrice,
      });
    }
    await cart.save();

    // 3. Log interaction
    await Interaction.create({
      userId: req.user._id,
      productId,
      action: 'ADD_TO_CART',
      weight: 4,
      metadata: { movedFromWishlist: true, categoryName: product.categoryName },
    });

    res.status(200).json({
      success: true,
      message: 'Product moved to cart successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
};
