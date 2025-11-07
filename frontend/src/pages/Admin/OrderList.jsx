// src/pages/Admin/OrderList.jsx
import React, { useState, useEffect } from 'react';
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import orderAPI from '../../api/admin/orderAPI';

// Empty State Component
const EmptyState = ({ onReset }) => (
  <div className="text-center py-16 px-6">
    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
      <Package className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      Chưa có đơn hàng nào
    </h3>
    <p className="text-gray-500 max-w-md mx-auto mb-4">
      {onReset
        ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc.'
        : 'Hệ thống chưa ghi nhận đơn hàng nào. Hãy chờ khách đặt hàng nhé!'}
    </p>
    {onReset && (
      <button
        onClick={onReset}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Xóa bộ lọc
      </button>
    )}
  </div>
);

// Loading Skeleton Component
const OrderSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="h-8 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4 border-b animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-40 flex-1"></div>
            <div className="h-6 bg-gray-200 rounded w-12"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchTerm || undefined,
      };
      const response = await orderAPI.getAll(params);
      setOrders(response.orders || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, selectedStatus, searchTerm]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleViewDetail = async (orderId) => {
    try {
      const order = await orderAPI.getById(orderId);
      setSelectedOrder(order);
      setShowModal(true);
    } catch (err) {
      alert('Lỗi khi tải chi tiết');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setPage(1);
  };

  // Badge functions
  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
      shipping: { label: 'Đang giao', color: 'bg-orange-100 text-orange-800' },
      delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
    };
    const c = config[status] || config.pending;
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.color}`}>{c.label}</span>;
  };

  const getPaymentStatusBadge = (status) => {
    const config = {
      pending: { label: 'Chưa thanh toán', color: 'bg-gray-100 text-gray-800' },
      paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' }
    };
    const c = config[status] || config.pending;
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.color}`}>{c.label}</span>;
  };

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateString) => 
    new Date(dateString).toLocaleString('vi-VN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    });

  // Error state
  if (error) {
    return (
      <div className="text-center p-10 text-red-600">
        Lỗi: {error}
        <button onClick={fetchOrders} className="ml-2 underline text-blue-600">
          Thử lại
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <OrderSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đơn hàng</h1>
          <p className="text-gray-600">
            {orders.length > 0
              ? `Tổng: ${orders.length} đơn (trang ${page}/${totalPages})`
              : 'Chưa có đơn hàng nào'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm mã đơn, tên, sđt..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipping">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Table + Empty State */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {orders.length === 0 ? (
            <EmptyState onReset={searchTerm || selectedStatus !== 'all' ? resetFilters : null} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Xem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-900">{order.orderCode}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer?.name || 'Khách vãng lai'}
                          </div>
                          <div className="text-xs text-gray-500">{order.shippingAddress.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.items.length} sp</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(order.totalAmount)}</td>
                        <td className="px-6 py-4">{getPaymentStatusBadge(order.paymentStatus)}</td>
                        <td className="px-6 py-4">{getStatusBadge(order.orderStatus)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleViewDetail(order._id)} 
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 p-4 border-t bg-gray-50">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Trước
                  </button>
                  <span className="px-4 text-sm text-gray-600">Trang {page} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal - Simplified */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h2>
                <p className="text-gray-600">Mã: {selectedOrder.orderCode}</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cập nhật trạng thái
                </label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipping">Đang giao</option>
                  <option value="delivered">Đã giao</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              
              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin khách hàng</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p><strong>Tên:</strong> {selectedOrder.customer?.name || selectedOrder.shippingAddress.name}</p>
                  <p><strong>Điện thoại:</strong> {selectedOrder.shippingAddress.phone}</p>
                  <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.province}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sản phẩm</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-sm text-gray-500">{item.product?.name || 'N/A'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-sm text-gray-600">Size: {item.variant?.size} | Màu: {item.variant?.color}</p>
                        <p className="text-sm text-gray-600">SL: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Tổng tiền:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;