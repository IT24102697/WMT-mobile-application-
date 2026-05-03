const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order:           { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:          { type: Number, required: true },
  method:          { type: String, enum: ['CASH','CARD','BANK_TRANSFER','QR'], required: true },
  status:          { type: String, enum: ['PENDING','COMPLETED','REFUNDED'], default: 'PENDING' },
  discount:        { type: Number, default: 0 },
  tax:             { type: Number, default: 0 },
  finalAmount:     { type: Number, required: true },
  transactionId:   { type: String },
  bankReference:   { type: String },
  refundReason:    { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);