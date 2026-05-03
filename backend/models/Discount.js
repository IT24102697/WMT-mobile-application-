const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true },
  description: { type: String },
  percent:     { type: Number, required: true },
  minOrder:    { type: Number, default: 0 },
  active:      { type: Boolean, default: true },
  usageLimit:  { type: Number, default: 100 },
  usageCount:  { type: Number, default: 0 },
  expiresAt:   { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Discount', discountSchema);