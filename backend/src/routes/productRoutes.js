// routes/productRoutes.js
import express from 'express';
import multer from 'multer';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct, // THÊM DÒNG NÀY
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// === MULTER CONFIG ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `product-${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  }
});

// === ROUTES ===
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

router.post('/', protect, admin, upload.single('thumbnail'), createProduct);
router.put('/:id', protect, admin, upload.single('thumbnail'), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// THÊM DÒNG NÀY: XÓA VĨNH VIỄN
router.delete('/:id/hard', protect, admin, hardDeleteProduct);

export default router;