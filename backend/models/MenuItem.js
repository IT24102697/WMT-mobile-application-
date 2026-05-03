const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  description:  { type: String },
  price:        { type: Number, required: true },
  category:     { type: String, required: true,
                  enum: ['BREAKFAST','LUNCH','DINNER','DRINKS','DESSERTS','SNACKS'] },
  imageUrl:     { type: String },
  available:    { type: Boolean, default: true },
  orderCount:   { type: Number, default: 0 },
  availableFrom:{ type: String },
  availableTo:  { type: String },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);