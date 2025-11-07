// models/Order.js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: {
    size: String,
    color: String,
    sku: String,
    price: Number
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true } // Giá tại thời điểm mua
});

const orderSchema = new mongoose.Schema({
  orderCode: { type: String, unique: true, required: true },
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    ward: String,
    district: String,
    province: String
  },
  paymentMethod: { 
    type: String, 
    enum: ['cod', 'bank_transfer', 'momo', 'vnpay', 'paypal'], 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'],
    default: 'pending'
  },
  note: String,
  shippedAt: Date,
  deliveredAt: Date
}, { timestamps: true });

// Tạo mã đơn hàng tự động
orderSchema.pre('save', function(next) {
  if (!this.orderCode) {
    this.orderCode = 'ORD' + Date.now().toString().slice(-6);
  }
  next();
});

export default mongoose.model('Order', orderSchema);