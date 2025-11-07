// src/api/admin/orderAPI.js
import axiosClient from "../axiosConfig.js";

const orderAPI = {
  // Lấy danh sách đơn hàng (admin) - có phân trang, tìm kiếm, lọc
  getAll: (params = {}) => axiosClient.get("/admin/orders", { params }),

  // Lấy chi tiết đơn hàng
  getById: (id) => axiosClient.get(`/admin/orders/${id}`),

  // Cập nhật trạng thái đơn hàng
  updateStatus: (id, orderStatus) =>
    axiosClient.patch(`/admin/orders/${id}/status`, { orderStatus }),
};

export default orderAPI;