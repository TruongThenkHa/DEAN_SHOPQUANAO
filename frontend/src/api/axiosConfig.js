// src/api/axiosConfig.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5001/api", // Đổi nếu backend chạy port khác
  // Không set Content-Type mặc định → để tự động xử lý FormData
});

// === GỬI TOKEN TỰ ĐỘNG ===
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Xử lý FormData (upload ảnh)
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// === XỬ LÝ LỖI 401: TỰ ĐỘNG ĐĂNG XUẤT ===
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);

    if (error.response?.status === 401) {
      // Xóa token + chuyển về login
      localStorage.removeItem("token");
      alert("Phiên đăng nhập hết hạn! Đang chuyển về trang đăng nhập...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;