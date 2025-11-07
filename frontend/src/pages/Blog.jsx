import React from "react";
import { Calendar } from "lucide-react";
import aodai from "../assets/aodai.jpg"; // ✅ import hình đúng cách

export default function BlogCard({ article }) {
  // Dữ liệu mẫu
  const defaultArticle = {
    id: 1,
    category: "GÓC TƯ VẤN MẶC ĐẸP",
    title: 'Bộ Sưu Tập Áo Dài Tết 2025 "NGHÊNH XUÂN CA" Trọn Vẹn Sắc Xuân',
    excerpt:
      "Bốn mùa thay đổi, muôn vạt chuyển xoay nhưng có lẽ không gì đẹp hơn khoảnh khắc giao mùa trọn vẹn của những ngày Tết khi gợi ghém trọn vẹn...",
    date: "31/12/2024",
    image: aodai, // ✅ dùng biến import ở trên
    link: "/blog/ao-dai-tet-2025",
  };

  const item = article || defaultArticle;

  return (
    <article className="group cursor-pointer">
      <div className="flex flex-col md:flex-row gap-0 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
        {/* Image Side */}
        <div className="relative md:w-[40%] aspect-[16/10] md:aspect-auto overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect fill='%23f0f0f0' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='24'%3EBlog Image%3C/text%3E%3C/svg%3E";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content Side */}
        <div className="flex flex-col justify-center md:w-[40%] p-6 md:p-8 lg:p-10 bg-gray-50">
          <div className="mb-3">
            <span className="text-rose-400 text-xs font-medium tracking-wider uppercase">
              {item.category}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4 text-gray-500 text-xs">
            <Calendar size={14} />
            <time dateTime={item.date}>{item.date}</time>
          </div>

          <h3 className="text-lg md:text-xl lg:text-2xl font-serif text-gray-900 mb-3 group-hover:text-rose-500 transition-colors duration-300 line-clamp-2 leading-snug">
            {item.title}
          </h3>

          <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
            {item.excerpt}
          </p>

          <button className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-600 font-medium text-xs uppercase tracking-wide transition-colors duration-200 group/btn">
            <span>Đọc tin ngay</span>
            <svg
              className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

// ---------------------------
// Component hiển thị danh sách blog
// ---------------------------
export function BlogSection() {
  const articles = [
    {
      id: 1,
      category: "GÓC TƯ VẤN MẶC ĐẸP",
      title: 'Bộ Sưu Tập Áo Dài Tết 2025 "NGHÊNH XUÂN CA" Trọn Vẹn Sắc Xuân',
      excerpt:
        "Bốn mùa thay đổi, muôn vạt chuyển xoay nhưng có lẽ không gì đẹp hơn khoảnh khắc giao mùa trọn vẹn của những ngày Tết khi gợi ghém trọn vẹn...",
      date: "31/12/2024",
      image: "/images/blog/ao-dai-tet.jpg",
      link: "/blog/ao-dai-tet-2025",
    },
    {
      id: 2,
      category: "XU HƯỚNG THỜI TRANG",
      title: "Phong Cách Vintage Đang Quay Trở Lại Mạnh Mẽ Năm 2025",
      excerpt:
        "Xu hướng thời trang vintage không chỉ là sự hoài niệm mà còn là cách thể hiện phong cách độc đáo và bền vững của người mặc...",
      date: "28/12/2024",
      image: "/images/blog/vintage-style.jpg",
      link: "/blog/vintage-style-2025",
    },
    {
      id: 3,
      category: "MẸO MẶC ĐẸP",
      title: "Cách Phối Đồ Với Áo Sơ Mi Trắng - Item Không Bao Giờ Lỗi Mốt",
      excerpt:
        "Áo sơ mi trắng là món đồ kinh điển mà mọi tủ đồ đều nên có. Hãy cùng khám phá những cách phối đồ thú vị với item này...",
      date: "25/12/2024",
      image: "/images/blog/ao-so-mi-trang.jpg",
      link: "/blog/phoi-ao-so-mi-trang",
    },
  ];

  return (
    <section className="w-full py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-2">
            Góc tư vấn mặc đẹp
          </h2>
          <div className="w-20 h-1 bg-rose-400" />
        </div>

        <div className="space-y-8 md:space-y-12">
          {articles.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-300 hover:border-rose-400 text-gray-700 hover:text-rose-500 font-medium rounded-full transition-all duration-300 hover:shadow-md">
            Xem thêm bài viết
          </button>
        </div>
      </div>
    </section>
  );
}

// ---------------------------
// Component Featured Blog
// ---------------------------
export function FeaturedBlog() {
  const featuredArticle = {
    id: 1,
    category: "GÓC TƯ VẤN MẶC ĐẸP",
    title: 'Bộ Sưu Tập Áo Dài Tết 2025 "NGHÊNH XUÂN CA" Trọn Vẹn Sắc Xuân',
    excerpt:
      "Bốn mùa thay đổi, muôn vạt chuyển xoay nhưng có lẽ không gì đẹp hơn khoảnh khắc giao mùa trọn vẹn của những ngày Tết khi gợi ghém trọn vẹn...",
    date: "31/12/2024",
    image: "/images/blog/ao-dai-tet-featured.jpg",
    link: "/blog/ao-dai-tet-2025",
  };

  return (
    <section className="w-full py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-800">
            Góc tư vấn mặc đẹp
          </h2>
        </div>

        <BlogCard article={featuredArticle} />
      </div>
    </section>
  );
}
