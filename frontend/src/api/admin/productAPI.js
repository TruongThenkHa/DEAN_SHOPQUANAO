// src/api/admin/productAPI.js
import axiosClient from "../axiosConfig.js";

const productAPI = {
  // Lấy tất cả sản phẩm
  getAll: () => axiosClient.get("/products"),

  // Tạo sản phẩm mới
  create: (data) => axiosClient.post("/products", data),

  // Cập nhật sản phẩm
  update: (id, data) => axiosClient.put(`/products/${id}`, data),

  // Xóa vĩnh viễn
  hardDelete: (id) => axiosClient.delete(`/products/${id}/hard`),

  // Toggle trạng thái
  toggleStatus: (id, isActive) =>
    axiosClient.patch(`/products/${id}/status`, { isActive }),
};

export default productAPI;