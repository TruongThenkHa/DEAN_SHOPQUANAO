import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Debug: mở DevTools → Console để xem
  console.log("AdminRoute kiểm tra role:", user.role);

  return user.role === "admin" ? children : <Navigate to="/pages/notfound" replace />;
};

export default AdminRoute;