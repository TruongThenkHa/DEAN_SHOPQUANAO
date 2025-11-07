// controllers/paymentController.js
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import asyncHandler from 'express-async-handler';

// @desc    Tạo thanh toán (tự động khi tạo đơn hoặc thủ công)
// @route   POST /api/payments
// @access  Private/Admin
export const createPayment = asyncHandler(async (req, res) => {
  const { orderId, amount, method, type = 'income', note } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new Error('Đơn hàng không tồn tại');

  const payment = await Payment.create({
    order: orderId,
    amount,
    method,
    type,
    status: method === 'cod' ? 'pending' : 'pending',
    note,
    createdBy: req.user._id
  });

  res.status(201).json(payment);
});

// @desc    Cập nhật trạng thái (webhook hoặc admin)
// @route   PUT /api/payments/:id
// @access  Private/Admin hoặc Webhook
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status, transactionId, note } = req.body;
  const payment = await Payment.findById(req.params.id);

  if (!payment) throw new Error('Thanh toán không tồn tại');

  payment.status = status;
  if (transactionId) payment.transactionId = transactionId;
  if (status === 'completed') payment.paidAt = Date.now();
  if (status.includes('refunded')) payment.refundedAt = Date.now();
  if (note) payment.note = note;

  await payment.save();

  // Đồng bộ với Order
  const order = await Order.findById(payment.order);
  if (order) {
    if (status === 'completed') {
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
    } else if (status === 'failed') {
      order.paymentStatus = 'failed';
    }
    await order.save();
  }

  res.json(payment);
});

// @desc    Báo cáo doanh thu
// @route   GET /api/payments/report
// @access  Private/Admin
export const getRevenueReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const match = { status: 'completed', type: 'income' };
  if (startDate && endDate) {
    match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const groupFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';
  const groupId = { $dateToString: { format: groupFormat, date: '$createdAt' } };

  const revenue = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: groupId,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const totalRevenue = revenue.reduce((sum, item) => sum + item.total, 0);

  res.json({
    revenue,
    totalRevenue,
    period: { startDate, endDate },
    groupBy
  });
});

// @desc    Danh sách thanh toán (admin)
// @route   GET /api/payments
// @access  Private/Admin
export const getPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;

  const filter = {};
  if (req.query.method) filter.method = req.query.method;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;

  const total = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter)
    .populate('order', 'orderCode totalAmount')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    payments,
    pagination: { page, pages: Math.ceil(total / limit), total }
  });
});