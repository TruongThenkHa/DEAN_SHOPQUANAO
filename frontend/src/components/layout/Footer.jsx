export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 pt-12 pb-6 border-t">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1: Logo + địa chỉ */}
        <div>
          <div className="text-2xl font-bold mb-4">
            M<span className="text-primary">Λ</span>RC
          </div>
          <p>
            Thương hiệu thời trang MARC - CÔNG TY CỔ PHẦN SẢN XUẤT THƯƠNG MẠI
            TẤM MINH PHÁT
          </p>
          <p className="mt-2 text-sm">
            Địa chỉ: C7/30QR3, Ấp 41, Xã Bình Hưng, Huyện Bình Chánh, TP. Hồ Chí
            Minh
          </p>
          <p className="mt-2 italic text-sm">
            Chính sách bảo mật <br />
            Các điều khoản và điều kiện
          </p>
        </div>

        {/* Cột 2: Về chúng tôi */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">Về chúng tôi</h3>
          <ul className="space-y-2 text-sm">
            <li>Giới thiệu MARC</li>
            <li>Tuyển dụng</li>
            <li>Cảm hứng thời trang</li>
            <li>Danh sách cửa hàng</li>
            <li>Nhượng quyền thương hiệu</li>
            <li>Chính sách giao hàng</li>
            <li>Chính sách bảo hành</li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ khách hàng */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">Hỗ trợ khách hàng</h3>
          <ul className="space-y-2 text-sm">
            <li>Liên hệ đến MARC</li>
            <li>Câu hỏi thường gặp</li>
            <li>Hướng dẫn tạo tài khoản</li>
            <li>Hướng dẫn đặt hàng</li>
            <li>Đổi/trả hàng</li>
            <li>Đánh giá sản phẩm</li>
          </ul>
        </div>

        {/* Cột 4: Liên lạc */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">Liên lạc</h3>
          <p>Đặt hàng trực tuyến (8h-21h):</p>
          <p className="text-primary font-semibold">1900 636942</p>
          <p className="mt-2">Chăm sóc khách hàng:</p>
          <p className="text-primary font-semibold">1900 636940</p>
          <p className="mt-2">support.marc@tmpfashion.vn</p>
        </div>
      </div>
    </footer>
  );
}
