// routes/AuthRoutes.js
import express from "express";
import {
  register,
  login,
  logout,
  googleLogin,
  facebookLogin,
  getMe,
  getAllUsers // ✅ thêm dòng này
} from "../controllers/AuthController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js"; // ✅ thêm dòng này để lấy danh sách user

const router = express.Router();

// ======= AUTH ROUTES =======
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", googleLogin);
router.post("/facebook", facebookLogin);
router.get("/me", protect, getMe);
router.get("/", getAllUsers); // 👈 thêm dòng này

// ======= ADMIN ROUTE: LẤY DANH SÁCH KHÁCH HÀNG =======
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Lấy tất cả, bỏ password
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
