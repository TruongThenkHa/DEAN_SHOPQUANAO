// routes/client/categoryRoutes.js
import express from 'express';
import Category from '../../models/Category.js';
import Product from '../../models/Product.js';

const router = express.Router();

/**
 * GET /api/client/categories
 * Lấy danh mục cha (dùng cho trang chủ)
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
      parent: null // Chỉ lấy danh mục cha
    })
      .select('name slug')
      .sort({ name: 1 })
      .lean();

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh mục' });
  }
});

/**
 * GET /api/client/categories/:slug/products
 * Lấy sản phẩm theo slug danh mục (có thể là cha hoặc con)
 */
router.get('/categories/:slug/products', async (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 12;

    // Tìm danh mục theo slug
    const category = await Category.findOne({ slug, isActive: true });
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    // Lấy tất cả ID danh mục con (nếu có)
    const getAllChildIds = async (parentId) => {
      const children = await Category.find({ parent: parentId, isActive: true }).select('_id');
      let ids = [parentId];
      for (const child of children) {
        ids = ids.concat(await getAllChildIds(child._id));
      }
      return ids;
    };

    const categoryIds = await getAllChildIds(category._id);

    // Đếm tổng sản phẩm
    const total = await Product.countDocuments({
      category: { $in: categoryIds },
      isActive: true
    });

    // Lấy sản phẩm
    const products = await Product.find({
      category: { $in: categoryIds },
      isActive: true
    })
      .select('name slug thumbnail basePrice variants')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Format dữ liệu cho frontend
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
        thumbnail: p.thumbnail || '/images/placeholder.jpg',
        price: minPrice,
        originalPrice: p.basePrice,
        discount,
        colors: [...new Set(p.variants.map(v => v.color))]
      };
    });

    res.json({
      category: {
        name: category.name,
        slug: category.slug
      },
      products: formatted,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;