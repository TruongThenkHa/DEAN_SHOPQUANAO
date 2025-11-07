// components/Header.jsx
import React from 'react';
import { Settings, LogOut } from 'lucide-react';

const Header = ({ managerInfo, onLogout }) => (
  <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
    <h2 className="text-xl font-semibold text-gray-800">
      {managerInfo.pageTitle || 'Tổng quan hệ thống'}
    </h2>
    
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm text-gray-600">
          Xin chào, <span className="font-medium">{managerInfo.name}</span>
        </p>
        <p className="text-xs text-blue-600">{managerInfo.role}</p>
      </div>
      
      <div className="relative group">
        <button className="flex items-center gap-2 hover:bg-gray-50 rounded-full p-2 transition-colors">
          <img
            src={managerInfo.avatar}
            alt="Manager"
            className="w-10 h-10 rounded-full border-2 border-gray-200"
          />
        </button>
        
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-t-xl">
            <p className="font-medium">{managerInfo.name}</p>
            <p className="text-sm opacity-90">{managerInfo.email}</p>
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

export default Header;