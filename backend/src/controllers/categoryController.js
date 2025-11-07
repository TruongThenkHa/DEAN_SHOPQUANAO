import Category from '../models/Category.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// @desc    Lấy tất cả danh mục
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ categories });
});

// @desc    Lấy danh mục theo ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy danh mục');
  }
});

// @desc    Tạo danh mục mới
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, parent, isActive } = req.body;

  // Kiểm tra trùng tên hoặc slug
  const nameExists = await Category.findOne({ name });
  if (nameExists) {
    res.status(400);
    throw new Error('Tên danh mục đã tồn tại');
  }

  const slugExists = await Category.findOne({ slug });
  if (slugExists) {
    res.status(400);
    throw new Error('Slug đã tồn tại');
  }

  const category = await Category.create({
    name,
    slug,
    description,
    parent: parent || null,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json(category);
});

// @desc    Cập nhật danh mục
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, parent, isActive } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Không tìm thấy danh mục');
  }

  // Kiểm tra trùng tên (trừ chính nó)
  if (name && name !== category.name) {
    const nameExists = await Category.findOne({ name });
    if (nameExists) {
      res.status(400);
      throw new Error('Tên danh mục đã tồn tại');
    }
  }

  // Kiểm tra trùng slug (trừ chính nó)
  if (slug && slug !== category.slug) {
    const slugExists = await Category.findOne({ slug });
    if (slugExists) {
      res.status(400);
      throw new Error('Slug đã tồn tại');
    }
  }

  // Cập nhật
  category.name = name || category.name;
  category.slug = slug || category.slug;
  category.description = description !== undefined ? description : category.description;
  category.parent = parent !== undefined ? (parent || null) : category.parent;
  category.isActive = isActive !== undefined ? isActive : category.isActive;

  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Xóa danh mục
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Không tìm thấy danh mục');
  }

  // Kiểm tra có danh mục con không
  const hasChildren = await Category.findOne({ parent: req.params.id });
  if (hasChildren) {
    res.status(400);
    throw new Error('Không thể xóa: Danh mục có danh mục con');
  }

  // Kiểm tra có sản phẩm không (nếu có Product model)
  const Product = mongoose.models.Product;
  if (Product) {
    const hasProducts = await Product.findOne({ category: req.params.id });
    if (hasProducts) {
      res.status(400);
      throw new Error('Không thể xóa: Có sản phẩm thuộc danh mục này');
    }
  }

  await category.deleteOne();
  res.json({ message: 'Xóa danh mục thành công' });
});
