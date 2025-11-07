// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true }, // Tên đăng nhập
  email: { type: String, unique: true, sparse: true }, // sparse: cho phép null (khi dùng GG/FB)
  phone: { type: String, unique: true, sparse: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  provider: { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },
  providerId: { type: String }, // ID từ Google/Facebook
  createdAt: { type: Date, default: Date.now }
});

// Hash mật khẩu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('user', userSchema);