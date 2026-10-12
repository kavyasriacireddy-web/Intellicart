const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name finalPrice price discount images stock brand categoryName',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items where product no longer exists
    const validItems = cart.items.filter((item) => item.product !== null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Calculate subtotal, discount total, and final total
    let subtotal = 0;
    let savings = 0;
    let finalTotal = 0;

    cart.items.forEach((item) => {
      const originalPrice = item.product.price || item.price;
      const effectivePrice = item.product.finalPrice || item.price;
      subtotal += originalPrice * item.quantity;
      finalTotal += effectivePrice * item.quantity;
    });

    savings = Math.max(0, subtotal - finalTotal);

    res.status(200).json({
      success: true,
      cart,
      summary: {
        itemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
        subtotal: Math.round(subtotal * 100) / 100,
        savings: Math.round(savings * 100) / 100,
        finalTotal: Math.round(finalTotal * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart or increase quantity
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: 'Product is out of stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    const addQty = Math.max(1, parseInt(quantity, 10));

    if (existingIndex > -1) {
      const newQuantity = cart.items[existingIndex].quantity + addQty;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Maximum available stock is ${product.stock}.`,
        });
      }
      cart.items[existingIndex].quantity = newQuantity;
      cart.items[existingIndex].price = product.finalPrice;
    } else {
      if (addQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${addQty} items. Maximum available stock is ${product.stock}.`,
        });
      }
      cart.items.push({
        product: product._id,
        quantity: addQty,
        price: product.finalPrice,
      });
    }

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name finalPrice price discount images stock brand categoryName',
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const newQty = parseInt(quantity, 10);
    if (isNaN(newQty) || newQty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (newQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available in stock`,
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }

    cart.items[itemIndex].quantity = newQty;
    cart.items[itemIndex].price = product.finalPrice;

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name finalPrice price discount images stock brand categoryName',
    });

    res.status(200).json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name finalPrice price discount images stock brand categoryName',
    });

    res.status(200).json({ success: true, message: 'Item removed from cart', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all items in cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, message: 'Cart cleared', cart: { items: [], totalPrice: 0 } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
};
