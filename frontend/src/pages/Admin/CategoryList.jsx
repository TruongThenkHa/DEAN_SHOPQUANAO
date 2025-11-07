import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Tag, FolderTree, ToggleLeft, ToggleRight, X } from 'lucide-react';
import categoryAPI from "../../api/admin/categoryAPI.js"; // ✅ import đúng default export


const CategoryManagement = () => {
const [categories, setCategories] = useState([]); // luôn là array
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState(null);

  useEffect(() => {
  fetchCategories(); // gọi API khi component mount
}, []);


  // LẤY DỮ LIỆU TỪ BACKEND
  const fetchCategories = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await categoryAPI.getAll(); // Axios trả về object { data: {...} }
    setCategories(response.data.categories); // lấy mảng categories
  } catch (err) {
    setError(err.response?.data?.message || 'Không thể tải danh mục');
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  // Tạo slug tự động
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
      ...(name === 'name' && !editingCategory ? { slug: generateSlug(value) } : {})
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, formData);
      } else {
        await categoryAPI.create(formData);
      }

      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories(); // Tải lại danh sách
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi lưu danh mục');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      isActive: category.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      await categoryAPI.delete(id);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xóa');
    }
  };

  const toggleStatus = async (category) => {
    try {
      const newStatus = !category.isActive;
      await categoryAPI.toggleStatus(category._id, newStatus);

      // Cập nhật local
      setCategories(prev =>
        prev.map(cat =>
          cat._id === category._id ? { ...cat, isActive: newStatus } : cat
        )
      );
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái');
      fetchCategories();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', isActive: true });
  };

  // Lọc danh mục
  const filteredCategories = categories.filter(category => {
    const matchSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && category.isActive) ||
      (filterStatus === 'inactive' && !category.isActive);
    return matchSearch && matchStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh mục...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-medium mb-4">Lỗi: {error}</p>
          <button
            onClick={fetchCategories}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FolderTree className="w-8 h-8 text-blue-600" />
              Quản Lý Danh Mục
            </h1>
            <p className="text-gray-600 mt-2">
              Tổng số danh mục: <span className="font-semibold">{categories.length}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Thêm Danh Mục
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm tên hoặc slug..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã ẩn</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên danh mục</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cập nhật</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      Không có danh mục nào
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Tag className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">{category.name}</div>
                            {category.description && (
                              <div className="text-sm text-gray-500">{category.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(category)}
                          className="flex items-center gap-1"
                        >
                          {category.isActive ? (
                            <>
                              <ToggleRight className="w-6 h-6 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">Hoạt động</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-6 h-6 text-gray-400" />
                              <span className="text-sm text-gray-500 font-medium">Đã ẩn</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(category.updatedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingCategory(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Điện thoại"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="dien-thoai"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tự động tạo từ tên</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Mô tả về danh mục..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Kích hoạt danh mục
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSubmit}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      {editingCategory ? 'Cập Nhật' : 'Tạo Danh Mục'}
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setEditingCategory(null);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;