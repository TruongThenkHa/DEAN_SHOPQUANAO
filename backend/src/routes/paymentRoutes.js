// routes/paymentRoutes.js
import express from 'express';
import {
  createPayment,
  updatePaymentStatus,
  getPayments,
  getRevenueReport
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Webhook (cần verify IP hoặc token)
router.put('/:id/webhook', updatePaymentStatus);

// Admin
router.post('/', protect, admin, createPayment);
router.put('/:id', protect, admin, updatePaymentStatus);
router.get('/', protect, admin, getPayments);
router.get('/report', protect, admin, getRevenueReport);

export default router;