import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Bảo đảm thư mục "uploads" tồn tại
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ⚙️ Cấu hình nơi lưu + tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Giữ nguyên tên gốc của ảnh
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Upload 1 ảnh
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có ảnh nào được tải lên!" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: "Upload thành công!",
    image: imageUrl,
  });
});

export default router;
