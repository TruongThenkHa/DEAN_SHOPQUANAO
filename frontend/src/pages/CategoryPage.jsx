// src/pages/CategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductsByCategorySlug } from '../api/categoryAPI';
import ProductCard from '../components/layout/ProductCard';
import CategoryMenu from '../components/layout/CategoryMenu';
import { ArrowLeft } from 'lucide-react';

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductsByCategorySlug(categorySlug)
      .then(setData)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [categorySlug, navigate]);

  if (loading) return <div className="py-20 text-center">Đang tải...</div>;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Menu danh mục - vẫn hiển thị */}
      <section className="w-full py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <CategoryMenu className="lg:grid-cols-7" />
        </div>
      </section>

      {/* Nút quay lại + tiêu đề */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-4"
          >
            <ArrowLeft size={20} /> Quay lại
          </button>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-800">
            {data.category.name}
          </h1>
        </div>
      </section>

      {/* Danh sách sản phẩm */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {data.products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">
              Chưa có sản phẩm nào trong danh mục này.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}