// models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  method: { 
    type: String, 
    enum: ['cod', 'bank_transfer', 'momo', 'vnpay', 'paypal', 'wallet'], 
    required: true 
  },
  type: {
    type: String,
    enum: ['income', 'refund'],
    default: 'income'
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded', 'partial_refunded'], 
    default: 'pending' 
  },
  transactionId: String,
  paidAt: Date,
  refundedAt: Date,
  note: String,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  } // Admin tạo thủ công
}, { timestamps: true });

// Index để báo cáo nhanh
paymentSchema.index({ method: 1, status: 1, createdAt: -1 });
paymentSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);