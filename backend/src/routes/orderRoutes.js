// routes/orderRoutes.js
import express from 'express';
import {
  createOrder,
  getOrderById,
  getOrders,           // Admin: phân trang
  updateOrderStatus,   // Admin: cập nhật trạng thái
  cancelOrder
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Customer
router.post('/', protect, createOrder);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

// Admin
router.get('/', protect, admin, getOrders);
router.patch('/:id/status', protect, admin, updateOrderStatus);

export default router;