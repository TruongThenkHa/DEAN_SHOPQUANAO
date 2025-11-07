import React, { useState } from 'react';
import { Heart } from 'lucide-react';

export default function ProductCard() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);

  const product = {
    name: 'Đầm dài caro cổ bẩn',
    price: 715500,
    originalPrice: 795000,
    discount: 10,
    image: '/images/products/dam-caro-do.jpg',
    colors: [
      { name: 'Tím', hex: '#B8A8C8' },
      { name: 'Trắng', hex: '#F5F5F5' },
      { name: 'Xanh Mint', hex: '#A8C8B8' },
      { name: 'Đỏ', hex: '#C85A7C' }
    ]
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <div className="max-w-sm bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 group">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 533"%3E%3Crect fill="%23f0f0f0" width="400" height="533"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="20"%3EProduct Image%3C/text%3E%3C/svg%3E';
          }}
        />

        {/* Discount Badge */}
        <div className="absolute top-3 left-3 bg-rose-400 text-white text-sm font-bold px-3 py-1.5 rounded-md shadow-md">
          -{product.discount}%
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
        >
          <Heart
            size={22}
            className={`${
              isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-gray-400'
            } transition-colors duration-200`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-gray-800 font-normal text-base mb-3 hover:text-rose-500 cursor-pointer transition-colors duration-200">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-red-600 font-bold text-lg">
            {formatPrice(product.price)}
          </span>
          <span className="text-gray-400 line-through text-sm">
            {formatPrice(product.originalPrice)}
          </span>
        </div>

        {/* Color Options */}
        <div className="flex gap-2">
          {product.colors.map((color, index) => (
            <button
              key={index}
              onClick={() => setSelectedColor(index)}
              className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                selectedColor === index
                  ? 'border-gray-800 scale-110'
                  : 'border-gray-300 hover:border-gray-500'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}