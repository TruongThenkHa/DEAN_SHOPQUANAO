import axiosClient from "../api/axiosConfig";

const authAPI = {
  register: (data) => axiosClient.post("/users/register", data),
  login: (data) => axiosClient.post("/users/login", data),
};

export default authAPI;
