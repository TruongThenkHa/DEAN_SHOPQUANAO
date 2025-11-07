import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Package, ChevronDown, ChevronUp, X, Upload } from 'lucide-react';
import productAPI from '../../api/admin/productAPI';
import categoryAPI from '../../api/admin/categoryAPI';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand: '',
    category: '',
    basePrice: '',
    description: '',
    thumbnail: null,
    thumbnailPreview: '',
    variants: [{ size: '', color: '', sku: '', price: '', stock: '' }],
    isActive: true
  });

  const fileInputRef = useRef(null);

  // === TẢI SẢN PHẨM ===
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productAPI.getAll();
      setProducts(response.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải sản phẩm');
      console.error('Lỗi tải sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  // === TẢI DANH MỤC ===
  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Filter
  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' ||
                        (filterStatus === 'active' && product.isActive) ||
                        (filterStatus === 'inactive' && !product.isActive);
    return matchSearch && matchStatus;
  });

  const toggleExpand = (productId) => {
    setExpandedRows(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const toggleStatus = async (productId) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    try {
      const newStatus = !product.isActive;
      await productAPI.toggleStatus(productId, newStatus);
      setProducts(prev => prev.map(p => p._id === productId ? { ...p, isActive: newStatus } : p));
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
      fetchProducts();
    }
  };

  const handleHardDelete = async (productId) => {
    if (!window.confirm('XÓA VĨNH VIỄN? Không thể khôi phục!')) return;
    try {
      await productAPI.hardDelete(productId);
      alert('Xóa vĩnh viễn thành công!');
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi server';
      alert('LỖI XÓA: ' + msg);
    }
  };

  // === FORM HANDLERS ===
  const openAddModal = () => {
    setIsEditMode(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      brand: '',
      category: '',
      basePrice: '',
      description: '',
      thumbnail: null,
      thumbnailPreview: '',
      variants: [{ size: '', color: '', sku: '', price: '', stock: '' }],
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setIsEditMode(true);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      brand: product.brand || '',
      category: product.category?._id || '',
      basePrice: product.basePrice,
      description: product.description || '',
      thumbnail: null,
      thumbnailPreview: product.thumbnail ? `http://localhost:5001${product.thumbnail}` : '',
      variants: product.variants.map(v => ({
        size: v.size,
        color: v.color,
        sku: v.sku,
        price: v.price,
        stock: v.stock
      })),
      isActive: product.isActive
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ ...formData, thumbnail: null, thumbnailPreview: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && {
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      })
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: '', color: '', sku: '', price: '', stock: '' }]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.variants.some(v => 
      !v.size || !v.color || !v.sku || 
      v.price === '' || v.stock === ''
    )) {
      alert('Vui lòng nhập đầy đủ: Size, Màu, SKU, Giá, Tồn kho');
      return;
    }

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('slug', formData.slug);
    submitData.append('brand', formData.brand || '');
    submitData.append('category', formData.category || editingProduct?.category?._id || '');
    submitData.append('basePrice', parseFloat(formData.basePrice || 0));
    submitData.append('description', formData.description || '');
    submitData.append('isActive', formData.isActive);

    if (formData.thumbnail) {
      submitData.append('thumbnail', formData.thumbnail);
    }

    submitData.append('variants', JSON.stringify(
      formData.variants.map(v => ({
        size: v.size,
        color: v.color,
        sku: v.sku,
        price: parseFloat(v.price || 0),
        stock: parseInt(v.stock || 0, 10)
      }))
    ));

    try {
      if (isEditMode) {
        await productAPI.update(editingProduct._id, submitData);
      } else {
        await productAPI.create(submitData);
      }
      fetchProducts();
      closeModal();
    } catch (err) {
      console.error('LỖI GỌI API:', err);
      let msg = 'Lỗi không xác định!';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response?.status) {
        msg = `Lỗi server: ${err.response.status}`;
      } else if (err.request) {
        msg = 'Không kết nối được server!';
      } else {
        msg = err.message;
      }
      alert('LỖI: ' + msg);
    }
  };

  // Helper
  const getTotalStock = (variants) => variants?.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0) || 0;
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '---';

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md">
        <p className="text-red-600 font-medium mb-4">Lỗi: {error}</p>
        <button onClick={fetchProducts} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Thử lại</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Sản Phẩm</h1>
          <p className="text-gray-600">Tổng số: {filteredProducts.length} sản phẩm</p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, slug, thương hiệu..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang bán</option>
                <option value="inactive">Ngừng bán</option>
              </select>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" /> Thêm sản phẩm
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 border-b border-gray-200 whitespace-nowrap">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <React.Fragment key={product._id}>
                  <tr className="hover:bg-gray-50">
                    {/* SỬA HÌNH ĐẸP, KHÔNG VỠ */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 min-w-[220px]">
                        <div className="relative shrink-0">
                          <img
                            src={product.thumbnail ? `http://localhost:5001${product.thumbnail}` : '/placeholder.png'}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200 shadow-sm"
                            onError={(e) => { e.target.src = '/placeholder.png'; }}
                          />
                          {getTotalStock(product.variants) === 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                              Hết
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500 truncate">{product.slug}</p>
                          {product.brand && (
                            <p className="text-xs font-medium text-purple-600 mt-0.5 truncate">{product.brand}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                        {product.category?.name || 'Chưa có'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(product.basePrice)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{getTotalStock(product.variants)}</span>
                        <button
                          onClick={() => toggleExpand(product._id)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          {expandedRows[product._id] ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(product._id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          product.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {product.isActive ? <><Eye className="w-3 h-3"/> Đang bán</> : <><EyeOff className="w-3 h-3"/> Ngừng bán</>}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(product.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4"/>
                        </button>
                        <button
                          onClick={() => handleHardDelete(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Variants */}
                  {expandedRows[product._id] && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {product.variants.map((variant, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-medium text-gray-900">{variant.size} - {variant.color}</span>
                                  <p className="text-xs text-gray-500">SKU: {variant.sku}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded ${
                                  variant.stock > 20 ? 'bg-green-100 text-green-800'
                                  : variant.stock > 0 ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                                }`}>{variant.stock} sp</span>
                              </div>
                              <p className="text-sm font-medium text-blue-600">{formatPrice(variant.price)}</p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
              <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form - giữ nguyên */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{isEditMode ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5"/>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Form giữ nguyên như cũ */}
              {/* ... (giữ nguyên phần form) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input type="text" name="slug" required value={formData.slug} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name} {!cat.isActive && '(ẩn)'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá cơ bản *</label>
                  <input type="number" name="basePrice" required value={formData.basePrice} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select name="isActive" value={formData.isActive} onChange={e => setFormData(prev => ({...prev, isActive: e.target.value === 'true'}))} className="w-full px-3 py-2 border rounded-lg">
                    <option value={true}>Đang bán</option>
                    <option value={false}>Ngừng bán</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
                <div className="flex items-center gap-4">
                  {formData.thumbnailPreview && (
                    <img src={formData.thumbnailPreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg"/>
                  )}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                    <Upload className="w-4 h-4"/> Tải lên
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Biến thể sản phẩm</h3>
                  <button type="button" onClick={addVariant} className="text-blue-600 hover:text-blue-800 text-sm font-medium">+ Thêm biến thể</button>
                </div>

                {formData.variants.map((variant, idx) => (
                  <div key={idx} className="border rounded-lg p-4 mb-4 relative">
                    {formData.variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(idx)} className="absolute top-2 right-2 p-1 hover:bg-red-50 rounded">
                        <X className="w-4 h-4 text-red-600"/>
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input placeholder="Kích thước" value={variant.size} required onChange={e => handleVariantChange(idx, 'size', e.target.value)} className="px-3 py-2 border rounded-lg" />
                      <input placeholder="Màu sắc" value={variant.color} required onChange={e => handleVariantChange(idx, 'color', e.target.value)} className="px-3 py-2 border rounded-lg" />
                      <input placeholder="SKU" value={variant.sku} required onChange={e => handleVariantChange(idx, 'sku', e.target.value)} className="px-3 py-2 border rounded-lg" />
                      <input type="number" placeholder="Giá" value={variant.price} required onChange={e => handleVariantChange(idx, 'price', e.target.value)} className="px-3 py-2 border rounded-lg" />
                      <input type="number" placeholder="Tồn kho" value={variant.stock} required onChange={e => handleVariantChange(idx, 'stock', e.target.value)} className="px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={closeModal} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {isEditMode ? 'Cập nhật' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductList;