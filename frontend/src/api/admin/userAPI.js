import axiosClient from "../axiosConfig.js";

const userAPI = {
  getCustomers: async () => {
    try {
      const res = await axiosClient.get("/users");
      return res.data; // Trả mảng user
    } catch (error) {
      console.error("❌ Lỗi lấy danh sách khách hàng:", error);
      throw error;
    }
  },
};

export default userAPI;
