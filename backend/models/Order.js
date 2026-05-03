const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem:  { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name:      { type: String, required: true },
  quantity:  { type: Number, required: true },
  unitPrice: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items:          [orderItemSchema],
  status:         { 
    type: String, 
    enum: ['PENDING','PREPARING','READY','DELIVERED','CANCELLED'],
    default: 'PENDING'
  },
  totalAmount:    { type: Number, required: true },
  specialRequest: { type: String },
  tableNumber:    { type: String },
  paymentStatus:  { type: String, enum: ['UNPAID','PAID'], default: 'UNPAID' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);