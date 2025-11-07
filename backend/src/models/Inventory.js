// models/Inventory.js
import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  productVariant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  sku: { type: String, required: true },
  size: String,
  color: String,
  quantity: { type: Number, default: 0 },
  warehouse: { type: String, default: 'Kho chính' },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Inventory', inventorySchema);