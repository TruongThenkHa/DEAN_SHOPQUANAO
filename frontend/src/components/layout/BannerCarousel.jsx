// src/components/layout/BannerCarousel.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import banner1 from '../../assets/banner1.jpg';
import banner2 from '../../assets/banner2.jpg';

export default function BannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { id: 1, image: banner1 },
    { id: 2, image: banner2 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full overflow-hidden py-16 md:py-24">
      <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
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

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-20"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-20"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
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
  );
}