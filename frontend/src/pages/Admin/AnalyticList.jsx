// src/pages/Admin/AnalyticList.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, CreditCard, Calendar, Download } from 'lucide-react';
import statisticsAPI from '../../api/admin/statisticsAPI';

const AnalyticList = () => {
  const [dateRange, setDateRange] = useState('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gọi API khi thay đổi filter
  useEffect(() => {
    fetchStatistics();
  }, [dateRange, startDate, endDate]);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { range: dateRange };
      if (dateRange === 'custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await statisticsAPI.getRevenue(params);
      setStatistics(response.data?.data || response.data || {}); // ✅ đảm bảo không bị undefined
    } catch (err) {
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const exportToCSV = () => {
    if (!statistics?.dailyRevenue?.length) return;

    const csvContent = [
      ['Ngày', 'Doanh thu', 'Đơn hàng', 'Hoàn tiền'],
      ...statistics.dailyRevenue.map(day => [
        day.date,
        day.revenue,
        day.orders,
        day.refund
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `doanh-thu-${dateRange}.csv`;
    link.click();
  };

  // LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={fetchStatistics}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Không có dữ liệu
  if (!statistics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  const summary = statistics?.summary || {};
  const dailyRevenue = statistics?.dailyRevenue || [];
  const paymentMethods = statistics?.paymentMethods || [];
  const topProducts = statistics?.topProducts || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thống Kê Doanh Thu</h1>
            <p className="text-gray-600 mt-1">Báo cáo chi tiết về doanh thu và đơn hàng</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" />
            Xuất CSV
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Khoảng thời gian
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="7days">7 ngày qua</option>
                <option value="30days">30 ngày qua</option>
                <option value="thisMonth">Tháng này</option>
                <option value="lastMonth">Tháng trước</option>
                <option value="custom">Tùy chỉnh</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* --- Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card title="Tổng doanh thu" icon={<DollarSign className="text-blue-600" />} value={formatCurrency(summary.totalRevenue)} />
          <Card title="Tổng đơn hàng" icon={<ShoppingCart className="text-purple-600" />} value={summary.totalOrders || 0} />
          <Card title="Giá trị TB/Đơn" icon={<CreditCard className="text-green-600" />} value={formatCurrency(summary.averageOrderValue)} />
          <Card title="Hoàn tiền" icon={<TrendingUp className="text-red-600 rotate-180" />} value={formatCurrency(summary.totalRefund)} />
        </div>

        {/* --- Biểu đồ --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ChartLine dailyRevenue={dailyRevenue} formatCurrency={formatCurrency} />
          <ChartPie paymentMethods={paymentMethods} formatCurrency={formatCurrency} />
        </div>

        {/* --- Bar chart --- */}
        <ChartBar dailyRevenue={dailyRevenue} />

        {/* --- Top sản phẩm --- */}
        <TopProducts topProducts={topProducts} totalRevenue={summary.totalRevenue} formatCurrency={formatCurrency} />
      </div>
    </div>
  );
};

// ✅ Các component nhỏ để code gọn gàng
const Card = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
    <div className="bg-gray-100 p-3 rounded-lg">{icon}</div>
  </div>
);

const ChartLine = ({ dailyRevenue, formatCurrency }) => (
  <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-lg font-semibold mb-4">Biểu đồ doanh thu theo ngày</h2>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dailyRevenue}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
        <Tooltip formatter={(v) => formatCurrency(v)} />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Doanh thu" />
        <Line type="monotone" dataKey="refund" stroke="#ef4444" name="Hoàn tiền" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const ChartPie = ({ paymentMethods, formatCurrency }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={paymentMethods} dataKey="value" nameKey="name" outerRadius={80}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {paymentMethods.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip formatter={(v, n, p) => [formatCurrency(p.payload.amount || v), n]} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const ChartBar = ({ dailyRevenue }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
    <h2 className="text-lg font-semibold mb-4">Số lượng đơn hàng theo ngày</h2>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={dailyRevenue}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="orders" fill="#8b5cf6" name="Số đơn" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const TopProducts = ({ topProducts, totalRevenue, formatCurrency }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-lg font-semibold mb-4">Top 5 sản phẩm bán chạy</h2>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b">
          <tr>
            <th className="text-left py-3 px-4">Sản phẩm</th>
            <th className="text-right py-3 px-4">Doanh thu</th>
            <th className="text-right py-3 px-4">Số lượng</th>
            <th className="text-right py-3 px-4">Tỷ trọng</th>
          </tr>
        </thead>
        <tbody>
          {topProducts.length === 0 ? (
            <tr><td colSpan="4" className="text-center py-4 text-gray-500">Không có sản phẩm nào</td></tr>
          ) : topProducts.map((p, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">{i + 1}</span>
                <span>{p.name}</span>
              </td>
              <td className="text-right">{formatCurrency(p.revenue)}</td>
              <td className="text-right">{p.quantity}</td>
              <td className="text-right">
                <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                  {totalRevenue ? ((p.revenue / totalRevenue) * 100).toFixed(1) : 0}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AnalyticList;
