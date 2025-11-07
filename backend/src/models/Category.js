import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null } // Danh mục cha
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
