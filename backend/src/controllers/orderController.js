// controllers/orderController.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private (hoặc Public nếu cho khách vãng lai)
export const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    note
  } = req.body;

  const customer = req.user?._id || null; // Nếu có user → gán, không thì null

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('Giỏ hàng trống');
  }

  if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone) {
    res.status(400);
    throw new Error('Thông tin giao hàng không hợp lệ');
  }

  // Kiểm tra tồn kho + tính tổng tiền
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Sản phẩm không tồn tại: ${item.product}`);
    }

    const variant = product.variants.find(v => v.sku === item.variant.sku);
    if (!variant) {
      res.status(400);
      throw new Error(`Biến thể không tồn tại: ${item.variant.sku}`);
    }

    if (variant.stock < item.quantity) {
      res.status(400);
      throw new Error(`Không đủ hàng: ${product.name} - ${variant.color} (${variant.size})`);
    }

    const price = variant.price;
    totalAmount += price * item.quantity;

    orderItems.push({
      product: product._id,
      variant: {
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
        price
      },
      quantity: item.quantity,
      price
    });

    // Cập nhật tồn kho
    variant.stock -= item.quantity;
  }

  await product.save();

  // Tạo đơn hàng
  const order = await Order.create({
    orderCode: '', // Sẽ được tạo tự động trong pre-save
    customer,
    items: orderItems,
    totalAmount,
    shippingAddress,
    paymentMethod,
    note,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    orderStatus: 'pending'
  });

  const populatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name slug thumbnail');

  res.status(201).json(populatedOrder);
});

// @desc    Lấy đơn hàng theo ID
// @route   GET /api/orders/:id
// @access  Private (chủ đơn hoặc admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name slug thumbnail');

  if (!order) {
    res.status(404);
    throw new Error('Đơn hàng không tồn tại');
  }

  // Chỉ chủ đơn hoặc admin được xem
  if (req.user.role !== 'admin' && order.customer && order.customer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Không có quyền truy cập');
  }

  res.json(order);
});

// @desc    Lấy danh sách đơn hàng (admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status || '';
  const search = req.query.search || '';

  const query = {};

  if (status) query.orderStatus = status;
  if (search) {
    query.$or = [
      { orderCode: { $regex: search, $options: 'i' } },
      { 'shippingAddress.name': { $regex: search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('customer', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    orders,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Cập nhật trạng thái đơn hàng (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Đơn hàng không tồn tại');
  }

  if (orderStatus) {
    order.orderStatus = orderStatus;

    if (orderStatus === 'shipping') order.shippedAt = Date.now();
    if (orderStatus === 'delivered') order.deliveredAt = Date.now();
    if (orderStatus === 'cancelled') {
      // Hoàn kho
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        const variant = product.variants.find(v => v.sku === item.variant.sku);
        if (variant) variant.stock += item.quantity;
        await product.save();
      }
    }
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  await order.save();

  const populated = await Order.findById(order._id)
    .populate('customer', 'name')
    .populate('items.product', 'name');

  res.json(populated);
});

// @desc    Hủy đơn hàng (khách)
// @route   PUT /api/orders/:id/cancel
// @access  Private (chủ đơn)
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Đơn hàng không tồn tại');
  }

  if (order.customer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Không có quyền');
  }

  if (!['pending', 'confirmed'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error('Không thể hủy đơn hàng này');
  }

  order.orderStatus = 'cancelled';

  // Hoàn kho
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    const variant = product.variants.find(v => v.sku === item.variant.sku);
    if (variant) variant.stock += item.quantity;
    await product.save();
  }

  await order.save();
  res.json({ message: 'Đã hủy đơn hàng', order });
});