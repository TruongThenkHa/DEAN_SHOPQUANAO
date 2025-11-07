// components/layout/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, BarChart, Package, DollarSign, Tag, Shirt, ShoppingBag } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'customer', label: 'Quản lý Khách hàng', icon: <Users size={20} />, path: '/admin/customers' },
    { id: 'analytics', label: 'Thống kê Doanh thu', icon: <BarChart size={20} />, path: '/admin/analytics' },
    { id: 'category', label: 'Quản lý Danh mục', icon: <Tag size={20} />, path: '/admin/categories' },
    { id: 'product', label: 'Quản lý Sản phẩm', icon: <Shirt size={20} />, path: '/admin/products' },
    { id: 'order', label: 'Quản lý Đơn hàng', icon: <ShoppingBag size={20} />, path: '/admin/orders' },
  ];

  const currentPath = location.pathname;

  return (
    <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Shop Thời Trang</h1>
        <p className="text-sm text-gray-600 mt-1">Hệ thống quản lý</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
       
        {/* ✅ Đây là đoạn bạn hỏi — lặp qua menuItems */}
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)} // 👉 khi nhấn sẽ đổi trang trong Outlet
            className={`w-full text-left p-4 mb-3 rounded-xl font-medium transition-all flex items-center ${
              currentPath === item.path
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 border border-gray-200 hover:from-blue-50 hover:to-blue-100 hover:border-blue-200'
            }`}
          >
            <span className={`mr-3 ${currentPath === item.path ? 'text-white' : 'text-gray-600'}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
