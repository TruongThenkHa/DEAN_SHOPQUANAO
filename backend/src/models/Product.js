// models/Product.js
import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  brand: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  basePrice: { type: Number, required: true },
  description: { type: String, default: '' },
  thumbnail: { type: String }, // URL ảnh
  variants: [variantSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Virtual để populate category
productSchema.virtual('categoryInfo', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true
});

export default mongoose.model('Product', productSchema);