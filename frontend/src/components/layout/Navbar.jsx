import { ShoppingBag, Heart, User, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold tracking-widest">
          M<span className="text-primary">Λ</span>RC
        </div>

        {/* Menu */}
        <ul className="flex space-x-8 text-sm font-medium">
          <li className="hover:text-primary cursor-pointer">NEW IN</li>
          <li className="hover:text-primary cursor-pointer">SẢN PHẨM</li>
          <li className="hover:text-primary cursor-pointer">LOOKBOOK</li>
          <li className="hover:text-primary cursor-pointer">DỊP/SỰ KIỆN</li>
          <li className="hover:text-primary cursor-pointer">BLOG</li>
          <li className="hover:text-primary cursor-pointer">CỬA HÀNG</li>
        </ul>

        {/* Icons */}
        <div className="flex space-x-6 items-center">
          <Heart size={22} className="cursor-pointer hover:text-primary" />
          <ShoppingBag size={22} className="cursor-pointer hover:text-primary" />
          <Link to="/Home">
                <User size={22} className="cursor-pointer hover:text-primary" />
        </Link>
          <Search size={22} className="cursor-pointer hover:text-primary" />
        </div>
      </div>
    </nav>
  );
}
