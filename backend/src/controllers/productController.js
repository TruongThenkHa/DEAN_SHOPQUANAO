// controllers/productController.js
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import slugify from 'slugify';
import asyncHandler from 'express-async-handler';
import fs from 'fs'; // THÊM DÒNG NÀY
import path from 'path'; // THÊM DÒNG NÀY

// @desc    Lấy danh sách sản phẩm
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  console.log('Query nhận được:', req.query);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { isActive: true };

  if (req.query.category) query.category = req.query.category;
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    products,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
  });
});

// @desc    Lấy sản phẩm theo slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug');

  if (!product) {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }

  res.json(product);
});

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    brand,
    category,
    basePrice,
    description,
    variants: variantsRaw,
    isActive
  } = req.body;

  const thumbnail = req.file ? `/uploads/products/${req.file.filename}` : null;

  if (!name || !category || !basePrice || !variantsRaw) {
    res.status(400);
    throw new Error('Vui lòng nhập đầy đủ thông tin sản phẩm');
  }

  let variants = [];
  try {
    variants = JSON.parse(variantsRaw);
  } catch (err) {
    res.status(400);
    throw new Error('Dữ liệu biến thể không hợp lệ');
  }

  if (!Array.isArray(variants) || variants.length === 0) {
    res.status(400);
    throw new Error('Sản phẩm phải có ít nhất một biến thể');
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error('Danh mục không tồn tại');
  }

  const finalSlug = slug || slugify(name, { lower: true, strict: true });
  const slugExists = await Product.findOne({ slug: finalSlug });
  if (slugExists) {
    res.status(400);
    throw new Error('Slug đã tồn tại');
  }

  const skus = variants.map(v => v.sku);
  const duplicateSkus = skus.filter((sku, i) => skus.indexOf(sku) !== i);
  if (duplicateSkus.length > 0) {
    res.status(400);
    throw new Error(`SKU bị trùng: ${duplicateSkus.join(', ')}`);
  }

  const product = await Product.create({
    name,
    slug: finalSlug,
    brand: brand || '',
    category,
    basePrice: parseFloat(basePrice),
    description: description || '',
    thumbnail,
    variants: variants.map(v => ({
      size: v.size,
      color: v.color,
      sku: v.sku,
      price: parseFloat(v.price),
      stock: parseInt(v.stock, 10)
    })),
    isActive: isActive === 'true' || isActive === true
  });

  const populatedProduct = await Product.findById(product._id).populate('category', 'name');

  res.status(201).json(populatedProduct);
});

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }

  const {
    name,
    slug,
    brand,
    category,
    basePrice,
    description,
    variants: variantsRaw,
    isActive
  } = req.body;

  const thumbnail = req.file ? `/uploads/products/${req.file.filename}` : product.thumbnail;

  let finalSlug = product.slug;
  if (name && name !== product.name) {
    finalSlug = slug || slugify(name, { lower: true, strict: true });
    const slugExists = await Product.findOne({
      slug: finalSlug,
      _id: { $ne: product._id }
    });
    if (slugExists) {
      res.status(400);
      throw new Error('Slug đã tồn tại');
    }
    product.name = name;
    product.slug = finalSlug;
  } else if (slug && slug !== product.slug) {
    const slugExists = await Product.findOne({
      slug,
      _id: { $ne: product._id }
    });
    if (slugExists) {
      res.status(400);
      throw new Error('Slug đã tồn tại');
    }
    product.slug = slug;
  }

  product.brand = brand !== undefined ? brand : product.brand;
  product.category = category || product.category;
  product.basePrice = basePrice ? parseFloat(basePrice) : product.basePrice;
  product.description = description !== undefined ? description : product.description;
  product.thumbnail = thumbnail;
  product.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : product.isActive;

  if (variantsRaw) {
    let variants = [];
    try {
      variants = JSON.parse(variantsRaw);
    } catch {
      res.status(400);
      throw new Error('Dữ liệu biến thể không hợp lệ');
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      res.status(400);
      throw new Error('Phải có ít nhất 1 biến thể');
    }

    const skus = variants.map(v => v.sku);
    const duplicateSkus = skus.filter((sku, i) => skus.indexOf(sku) !== i);
    if (duplicateSkus.length > 0) {
      res.status(400);
      throw new Error(`SKU bị trùng: ${duplicateSkus.join(', ')}`);
    }

    const existingSkuProduct = await Product.findOne({
      'variants.sku': { $in: skus },
      _id: { $ne: product._id }
    });
    if (existingSkuProduct) {
      res.status(400);
      throw new Error('Một hoặc nhiều SKU đã tồn tại ở sản phẩm khác');
    }

    product.variants = variants.map(v => ({
      size: v.size,
      color: v.color,
      sku: v.sku,
      price: parseFloat(v.price),
      stock: parseInt(v.stock, 10)
    }));
  }

  const updated = await product.save();
  const populated = await Product.findById(updated._id).populate('category', 'name');

  res.json(populated);
});

// @desc    Xóa mềm sản phẩm
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }

  product.isActive = false;
  await product.save();

  res.json({ message: 'Đã ẩn sản phẩm' });
});

// === THÊM HÀM XÓA VĨNH VIỄN ===
const hardDeleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }

  // XÓA ẢNH TRÊN SERVER
  if (product.thumbnail) {
    const filePath = path.join(process.cwd(), 'uploads/products', path.basename(product.thumbnail));
    fs.unlink(filePath, (err) => {
      if (err) console.log('Không xóa được ảnh:', err.message);
    });
  }

  // XÓA HOÀN TOÀN TRONG DB
  await Product.findByIdAndDelete(id);

  res.json({ message: 'Xóa vĩnh viễn thành công!' });
});

// === EXPORT TẤT CẢ ===
export {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct, // THÊM DÒNG NÀY
};