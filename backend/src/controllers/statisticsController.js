// controllers/statisticsController.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';

export const getRevenueStats = asyncHandler(async (req, res) => {
  const { range = '7days', startDate, endDate } = req.query;

  let start, end;
  const now = new Date();

  switch (range) {
    case 'today':
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case 'yesterday':
      start = startOfDay(subDays(now, 1));
      end = endOfDay(subDays(now, 1));
      break;
    case '7days':
      start = startOfDay(subDays(now, 6));
      end = endOfDay(now);
      break;
    case '30days':
      start = startOfDay(subDays(now, 29));
      end = endOfDay(now);
      break;
    case 'thisMonth':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case 'lastMonth':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth);
      break;
    case 'custom':
      start = startOfDay(new Date(startDate));
      end = endOfDay(new Date(endDate));
      break;
    default:
      start = startOfDay(subDays(now, 6));
      end = endOfDay(now);
  }

  // Lấy tất cả đơn hàng trong khoảng
  const orders = await Order.find({
    createdAt: { $gte: start, $lte: end },
    orderStatus: { $ne: 'cancelled' } // Loại hủy
  }).populate('items.product', 'name');

  const cancelledOrders = await Order.find({
    createdAt: { $gte: start, $lte: end },
    orderStatus: 'cancelled'
  });

  // Tính tổng
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.orderStatus === 'delivered').length;
  const cancelledCount = cancelledOrders.length;
  const totalRefund = cancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Doanh thu theo ngày
  const dailyMap = {};
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    dailyMap[dateStr] = { revenue: 0, orders: 0, refund: 0 };
  }

  orders.forEach(order => {
    const dateStr = new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    if (dailyMap[dateStr]) {
      dailyMap[dateStr].revenue += order.totalAmount;
      dailyMap[dateStr].orders += 1;
    }
  });

  cancelledOrders.forEach(order => {
    const dateStr = new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    if (dailyMap[dateStr]) dailyMap[dateStr].refund += order.totalAmount;
  });

  const dailyRevenue = Object.entries(dailyMap).map(([date, data]) => ({
    date,
    ...data
  }));

  // Phương thức thanh toán
  const paymentMethods = [
    { name: 'COD', value: 0, amount: 0 },
    { name: 'Chuyển khoản', value: 0, amount: 0 },
    { name: 'VNPay', value: 0, amount: 0 },
    { name: 'MoMo', value: 0, amount: 0 }
  ];

  orders.forEach(order => {
    const method = order.paymentMethod;
    const item = paymentMethods.find(m => m.name.includes(method === 'cod' ? 'COD' : method));
    if (item) {
      item.amount += order.totalAmount;
      item.value += 1;
    }
  });

  paymentMethods.forEach(m => m.value = Math.round((m.amount / totalRevenue) * 100) || 0);

  // Top sản phẩm
  const productMap = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const name = item.product?.name || 'Không xác định';
      if (!productMap[name]) {
        productMap[name] = { revenue: 0, quantity: 0 };
      }
      productMap[name].revenue += item.price * item.quantity;
      productMap[name].quantity += item.quantity;
    });
  });

  const topProducts = Object.entries(productMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  res.json({
    success: true,
    data: {
      summary: {
        totalRevenue,
        totalOrders,
        completedOrders,
        cancelledOrders: cancelledCount,
        averageOrderValue,
        totalRefund
      },
      dailyRevenue,
      paymentMethods: paymentMethods.map(m => ({
        ...m,
        color: m.name === 'COD' ? '#8884d8' : m.name === 'Chuyển khoản' ? '#82ca9d' : m.name === 'VNPay' ? '#ffc658' : '#ff8042'
      })),
      topProducts
    }
  });
});