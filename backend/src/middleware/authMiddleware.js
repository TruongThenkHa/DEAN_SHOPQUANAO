// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Bảo vệ route – yêu cầu JWT hợp lệ
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Kiểm tra header Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Không có token → từ chối
  if (!token) {
    return res
      .status(401)
      .json({ message: 'Không có token, truy cập bị từ chối!' });
  }

  try {
    // 3. Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Lấy user từ DB (loại password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại!' });
    }

    // 5. Gắn user vào req
    req.user = user;
    next();
  } catch (err) {
    console.error('Lỗi xác thực token:', err.message);
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn!' });
  }
};

/**
 * Chỉ cho admin truy cập
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Chỉ ADMIN mới có quyền truy cập!' });
};