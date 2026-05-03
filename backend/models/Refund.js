const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  payment:     { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  order:       { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:      { type: Number, required: true },
  reason:      { type: String, required: true },
  status:      { type: String, enum: ['PENDING','APPROVED','REJECTED'], default: 'PENDING' },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNote:   { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Refund', refundSchema);