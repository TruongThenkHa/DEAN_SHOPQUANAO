// src/api/admin/statisticsAPI.js
import axiosClient from "../axiosConfig.js";

const statisticsAPI = {
  getRevenue: (params) => axiosClient.get("/statistics/revenue", { params })
};

export default statisticsAPI;