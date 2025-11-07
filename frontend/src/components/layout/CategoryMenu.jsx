// src/components/layout/CategoryMenu.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import categoryAPI from "../../api/admin/categoryAPI.js";
;

export default function CategoryMenu({ className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy slug hiện tại từ URL: /category/ao-thun → "ao-thun"
  const currentSlug = location.pathname.split('/category/')[1] || '';

  useEffect(() => {
  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getAll(); // ✅ dùng phương thức getAll
      setCategories(res.data.categories);
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err);
    }
  };
  loadCategories();
}, []);


  const handleClick = (slug) => {
    navigate(`/category/${slug}`);
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6 ${className}`}>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-32 h-32 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6 ${className}`}>
      {categories.map((category) => (
        <div
          key={category._id}
          onClick={() => handleClick(category.slug)}
          className="flex flex-col items-center group cursor-pointer"
        >
          <div
            className={`relative w-32 h-32 md:w-36 md:h-36 mb-4 transition-transform duration-300 group-hover:scale-105 rounded-full overflow-hidden shadow-md ring-4 ring-transparent ${
              currentSlug === category.slug ? 'ring-pink-500' : ''
            }`}
          >
            <img
              src={category.image || '/images/category-placeholder.jpg'} // fallback
              alt={category.name}
              className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-full"></div>
          </div>
          <h3
            className={`text-sm md:text-base font-serif text-center transition-colors duration-300 ${
              currentSlug === category.slug
                ? 'text-pink-600 font-bold'
                : 'text-gray-700 group-hover:text-pink-600'
            }`}
          >
            {category.name}
          </h3>
        </div>
      ))}
    </div>
  );
}