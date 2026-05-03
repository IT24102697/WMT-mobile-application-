const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name:         { type: String, required: true, unique: true },
  unit:         { type: String, required: true, enum: ['kg','g','L','ml','pcs','cups'] },
  currentStock: { type: Number, required: true, default: 0 },
  minStock:     { type: Number, required: true, default: 10 },
  price:        { type: Number, default: 0 },
  category:     { type: String },
  supplier:     { type: String },
  // How much is used per order item (default 0.5 units per order)
  usagePerOrder:{ type: Number, default: 0.5 },
}, { timestamps: true });

ingredientSchema.virtual('isLowStock').get(function () {
  return this.currentStock <= this.minStock;
});

ingredientSchema.virtual('stockStatus').get(function () {
  if (this.currentStock === 0) return 'OUT_OF_STOCK';
  if (this.currentStock <= this.minStock) return 'LOW';
  return 'HEALTHY';
});

ingredientSchema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Ingredient', ingredientSchema);