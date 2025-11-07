import axiosClient from "../axiosConfig.js";

const categoryAPI = {
  // Lấy tất cả danh mục
  getAll: () => axiosClient.get("/categories"),

  // Tạo danh mục mới
  create: (data) => axiosClient.post("/categories", data),

  // Cập nhật danh mục theo id
  update: (id, data) => axiosClient.put(`/categories/${id}`, data),

  // Xóa danh mục theo id
  delete: (id) => axiosClient.delete(`/categories/${id}`),

  // Chuyển trạng thái (active/inactive)
  toggleStatus: (id, isActive) =>
    axiosClient.patch(`/categories/${id}/status`, { isActive }),
};

export default categoryAPI;
