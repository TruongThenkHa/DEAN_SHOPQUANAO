// routes/statisticsRoutes.js
import express from 'express';
import { getRevenueStats } from '../controllers/statisticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/revenue', protect, admin, getRevenueStats);

export default router;