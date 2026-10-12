const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getAdminDashboardStats,
} = require('../controllers/orderController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

router.use(protect); // All order endpoints require authentication

// Admin metrics & order list
router.get('/stats/summary', authorizeAdmin, getAdminDashboardStats);
router.get('/', authorizeAdmin, getAllOrders);
router.put('/:id/status', authorizeAdmin, updateOrderStatus);

// User order operations
router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
