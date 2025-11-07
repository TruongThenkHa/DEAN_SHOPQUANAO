// Chỉ GET, tối ưu cho frontend khách
import express from 'express';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';

const router = express.Router();

// GET /api/client/products/category/:slug
router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 12;

    const category = await Category.findOne({ slug, isActive: true });
    if (!category) return res.status(404).json({ message: 'Danh mục không tồn tại' });

    const total = await Product.countDocuments({ 
      category: category._id, 
      isActive: true 
    });

    const products = await Product.find({ 
      category: category._id, 
      isActive: true 
    })
      .select('name slug thumbnail basePrice variants') // Chỉ lấy cần thiết
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const formatted = products.map(p => {
      const prices = p.variants.map(v => v.price);
      const minPrice = Math.min(...prices);
      const discount = p.basePrice > minPrice 
        ? Math.round((p.basePrice - minPrice) / p.basePrice * 100) 
        : 0;

      return {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        thumbnail: p.thumbnail,
        price: minPrice,
        originalPrice: p.basePrice,
        discount,
        colors: [...new Set(p.variants.map(v => v.color))]
      };
    });

    res.json({
      products: formatted,
      pagination: { page, pages: Math.ceil(total / limit), total }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy danh mục cho trang chủ
router.get('/categories', async (req, res) => {
  const categories = await Category.find({ 
    isActive: true, 
    parent: null 
  }).select('name slug').lean();
  res.json(categories);
});

export default router;