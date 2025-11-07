import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from "../components/layout/ProductCard";


// 🖼️ Import ảnh banner
import banner1 from '../assets/banner1.jpg';
import banner2 from '../assets/banner2.jpg';

// 🖼️ Import ảnh danh mục
import sig from '../assets/sig.png';
import back from '../assets/back.png';
import aokieu from '../assets/aokieu.png';
import aothun from '../assets/aothun.png';
import dam from '../assets/dam.png';
import quan from '../assets/quan.png';
import vay from '../assets/vay.png';


// ✅ Component chính (chỉ có 1 default)
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* 🖼️ Banner phía trên */}
      <BannerCarousel />

      {/* 🛍️ Sản phẩm hiển thị để test ProductCard */}
      <h2 className="text-2xl font-serif text-gray-800 mt-8 mb-4">
        Sản phẩm nổi bật (Test ProductCard)
      </h2>

      <div className="p-6">
        <ProductCard />
      </div>
    </div>
  );
}

// ✅ Component phụ (chỉ export bình thường)
export function BannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Danh sách ảnh banner
  const slides = [
    { id: 1, image: banner1 },
    { id: 2, image: banner2 },
  ];

  // Danh mục sản phẩm
  const categories = [
    { id: 1, name: 'SIGNATURE', image: sig },
    { id: 2, name: 'Back In Stock', image: back },
    { id: 3, name: 'Áo Kiểu', image: aokieu },
    { id: 4, name: 'Áo Thun', image: aothun },
    { id: 5, name: 'Đầm', image: dam },
    { id: 6, name: 'Quần', image: quan },
    { id: 7, name: 'Váy', image: vay },
  ];

  // Tự động chuyển ảnh banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  return (
    <>
      {/* 🖼️ Banner Carousel */}
      <div className="relative w-full overflow-hidden py-16 md:py-24">
        <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
            {/* Các slide */}
            <div
              className="flex transition-transform duration-700 ease-in-out h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className="min-w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
              ))}
            </div>

            {/* Nút chuyển trái */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-20"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>

            {/* Nút chuyển phải */}
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-20"
            >
              <ChevronRight size={24} className="text-gray-700" />
            </button>
          </div>

          {/* Dấu chấm nhỏ */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all rounded-full ${
                  currentSlide === index
                    ? 'w-6 h-2 bg-pink-500'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 🛍️ Category Section */}
      <section className="w-full py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-serif text-center mb-12 text-gray-800">
            Danh mục
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="relative w-32 h-32 md:w-36 md:h-36 mb-4 transition-transform duration-300 group-hover:scale-105 rounded-full overflow-hidden shadow-md">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-full"></div>
                </div>
                <h3 className="text-sm md:text-base font-serif text-gray-700 text-center group-hover:text-pink-600 transition-colors duration-300">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}