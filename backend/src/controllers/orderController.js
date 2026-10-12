const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Interaction = require('../models/Interaction');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod = 'COD',
      paymentResult,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items specified' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ success: false, message: 'Please provide full shipping address details' });
    }

    // 1. Validate stock and retrieve latest product prices
    const validatedItems = [];
    let itemsPrice = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name || item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`,
        });
      }

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.finalPrice,
        quantity: item.quantity,
      });

      itemsPrice += product.finalPrice * item.quantity;
    }

    // Standard e-commerce tax and shipping calculations
    const taxPrice = Math.round(itemsPrice * 0.12 * 100) / 100; // 12% GST
    const shippingPrice = itemsPrice > 100 ? 0 : 15; // Free shipping over $100
    const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

    const isPaid = paymentMethod !== 'COD';

    // 2. Create and persist Order
    const order = new Order({
      user: req.user._id,
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod,
      paymentResult: isPaid
        ? paymentResult || {
            id: `SIM_TXN_${Date.now()}`,
            status: 'COMPLETED',
            updateTime: new Date().toISOString(),
            paymentMethodDetail: paymentMethod,
          }
        : undefined,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt: isPaid ? Date.now() : null,
      orderStatus: 'CONFIRMED',
    });

    const savedOrder = await order.save();

    // 3. Deduct stock safely
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 4. Clear user's cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalPrice: 0 });

    // 5. Record PURCHASE interaction telemetry for AI Recommender
    for (const item of validatedItems) {
      await Interaction.create({
        userId: req.user._id,
        productId: item.product,
        action: 'PURCHASE',
        weight: 5,
        metadata: {
          orderId: savedOrder._id,
          quantity: item.quantity,
          amount: item.price * item.quantity,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: savedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name images categoryName brand');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization: only the order owner or Admin can view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (by User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled as it is already ${order.orderStatus.toLowerCase()}`,
      });
    }

    order.orderStatus = 'CANCELLED';
    order.cancelledAt = Date.now();
    order.cancellationReason = reason || 'Customer requested cancellation';

    await order.save();

    // Restock the items
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled and stock restored successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status.toUpperCase();
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      totalOrders,
      page: pageNum,
      pages: Math.ceil(totalOrders / limitNum) || 1,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = status;

    if (status === 'DELIVERED') {
      order.deliveredAt = Date.now();
      order.isPaid = true;
      if (!order.paidAt) order.paidAt = Date.now();
    }

    if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
      order.cancelledAt = Date.now();
      // Restock items
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for Admin
// @route   GET /api/orders/stats/summary
// @access  Private/Admin
const getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['PENDING', 'CONFIRMED', 'PROCESSING'] },
    });

    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const User = require('../models/User');
    const totalUsers = await User.countDocuments({ role: 'USER' });

    const totalProducts = await Product.countDocuments({});
    const lowStockProducts = await Product.find({ stock: { $lte: 15 } })
      .select('name stock price finalPrice categoryName images')
      .limit(6);

    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    // Monthly revenue aggregation for chart
    const monthlyRevenue = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        pendingOrders,
        totalUsers,
        totalProducts,
        lowStockProducts,
        recentOrders,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getAdminDashboardStats,
};
