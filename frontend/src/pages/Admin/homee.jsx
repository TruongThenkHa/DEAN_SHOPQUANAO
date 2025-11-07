import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import { Settings, LogOut } from "lucide-react";

// ==================== HEADER ====================
const Header = ({ managerInfo, onLogout }) => {
  const location = useLocation();

  // ✅ Tự động đổi tiêu đề trang theo URL
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      "/admin/customers": "Quản lý Khách hàng",
      "/admin/analytics": "Thống kê Doanh thu",
      "/admin/categories": "Quản lý Danh mục",
      "/admin/product": "Quản lý Sản phẩm",
      "/admin/orders": "Quản lý Đơn hàng",
    };
    return titles[path] || "Bảng điều khiển";
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Xin chào,{" "}
            <span className="font-medium">{managerInfo?.name || "Quản trị viên"}</span>
          </p>
          <p className="text-xs text-blue-600">{managerInfo?.role}</p>
        </div>

        <div className="relative group">
          <button className="flex items-center gap-2 hover:bg-gray-50 rounded-full p-2 transition-colors">
            <img
              src={managerInfo?.avatar}
              alt="Manager"
              className="w-10 h-10 rounded-full border-2 border-gray-200"
            />
          </button>

          {/* Menu dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-t-xl">
              <p className="font-medium">{managerInfo?.name}</p>
              <p className="text-sm opacity-90">{managerInfo?.email}</p>
            </div>

            <div className="p-2">
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3">
                <Settings size={16} />
                <span>Cài đặt hệ thống</span>
              </button>

              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors flex items-center gap-3"
              >
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== TRANG CHÍNH ====================
export default function Homee() {
  const navigate = useNavigate();

  // Thông tin admin mặc định
  const [managerInfo] = useState({
    name: "Quản trị viên",
    email: "admin@shop.com",
    role: "Quản lý hệ thống",
    avatar:
      "https://ui-avatars.com/api/?name=Admin&background=007bff&color=fff&size=40&rounded=true",
  });

  // ✅ Kiểm tra token khi load trang (nếu không có thì quay về login)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/users");
    }
  }, [navigate]);

  // ✅ Xử lý đăng xuất
  // ✅ Xử lý đăng xuất
const handleLogout = async () => {
  if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    const token = localStorage.getItem("token");

    try {
      // Gọi API logout tới backend
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error);
    } finally {
      // Xóa token localStorage và chuyển về login
      localStorage.removeItem("token");
      navigate("/users");
    }
  }
};

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Header + Nội dung */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header managerInfo={managerInfo} onLogout={handleLogout} />
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
