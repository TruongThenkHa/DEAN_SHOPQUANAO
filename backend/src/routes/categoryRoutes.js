import express from 'express';
import {
  getCategories,        // ✅ Đổi lại cho đúng tên export
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = express.Router();


// 🟢 Lấy tất cả danh mục
router.get('/', getCategories);

// 🟢 Lấy danh mục theo ID
router.get('/:id', getCategoryById);

// 🟡 Tạo danh mục mới (Admin)
router.post('/', createCategory);

// 🟠 Cập nhật danh mục (Admin)
router.put('/:id', updateCategory);

// 🔴 Xóa danh mục (Admin)
router.delete('/:id', deleteCategory);

export default router;
