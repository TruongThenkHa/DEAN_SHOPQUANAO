// controllers/AuthController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ==================== ĐĂNG KÝ ====================
export const register = async (req, res) => {
  const { name, username, email, phone, password, role } = req.body;

  try {
    if (!name || !username || !password || !email || !phone) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc!' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email phải có định dạng @gmail.com!' });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Số điện thoại phải có đúng 10 chữ số!' });
    }

    const [usernameExists, emailExists, phoneExists] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email }),
      User.findOne({ phone })
    ]);

    if (usernameExists) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });
    if (emailExists) return res.status(400).json({ message: 'Email đã được sử dụng!' });
    if (phoneExists) return res.status(400).json({ message: 'Số điện thoại đã được sử dụng!' });

    // Tạo user, nếu role = admin thì admin, còn không thì customer
    const user = await User.create({
      name,
      username,
      email,
      phone,
      password,
      provider: 'local',
      role: role === 'admin' ? 'admin' : 'customer'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Đăng ký thành công!',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Lỗi đăng ký:', err.message);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// ==================== ĐĂNG NHẬP ====================
export const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ!' });
    }

    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier },
        { phone: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại!' });
    }

    if (user.provider !== 'local') {
      return res.status(401).json({ message: 'Dùng Google/Facebook để đăng nhập!' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu sai!' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err.message);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// controllers/AuthController.js
let tokenBlacklist = [];

export const logout = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) tokenBlacklist.push(token);
  res.json({ message: 'Đăng xuất thành công!' });
};

// middleware/checkAuth.js
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Không có token' });
  if (tokenBlacklist.includes(token))
    return res.status(401).json({ message: 'Token đã bị thu hồi' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token không hợp lệ' });
    req.user = decoded;
    next();
  });
};


// ==================== GOOGLE LOGIN ====================
export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    const { sub, name, email } = response.data;

    let user = await User.findOne({ providerId: sub, provider: 'google' });

    if (!user) {
      let username = `gg_${sub.slice(0, 8)}`;
      let count = 1;
      while (await User.findOne({ username })) {
        username = `gg_${sub.slice(0, 8)}_${count++}`;
      }

      user = await User.create({
        name: name || 'Google User',
        email,
        username,
        provider: 'google',
        providerId: sub,
        role: 'customer'
      });
    }

    const jwtToken = generateToken(user._id);
    res.json({
      message: 'Google login OK!',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Google error:', err.message);
    res.status(400).json({ message: 'Google token lỗi!' });
  }
};

// ==================== FACEBOOK LOGIN ====================
export const facebookLogin = async (req, res) => {
  const { accessToken, userID } = req.body;

  try {
    const response = await axios.get(
      `https://graph.facebook.com/${userID}?fields=name,email&access_token=${accessToken}`
    );
    const { name, email } = response.data;

    let user = await User.findOne({ providerId: userID, provider: 'facebook' });

    if (!user) {
      let username = `fb_${userID.slice(0, 8)}`;
      let count = 1;
      while (await User.findOne({ username })) {
        username = `fb_${userID.slice(0, 8)}_${count++}`;
      }

      user = await User.create({
        name: name || 'Facebook User',
        email,
        username,
        provider: 'facebook',
        providerId: userID,
        role: 'customer'
      });
    }

    const jwtToken = generateToken(user._id);
    res.json({
      message: 'Facebook login OK!',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Facebook error:', err.message);
    res.status(400).json({ message: 'Facebook token lỗi!' });
  }
};

// ==================== LẤY DANH SÁCH NGƯỜI DÙNG ====================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // bỏ mật khẩu cho an toàn
    res.json(users); // trả về mảng người dùng
  } catch (err) {
    console.error("Lỗi lấy danh sách người dùng:", err.message);
    res.status(500).json({ message: "Không thể tải danh sách người dùng" });
  }
};


// ==================== GET CURRENT USER ====================
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
};
