const mongoose = require('mongoose');

const trustHistorySchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  change:   { type: Number, required: true },
  reason:   { type: String, required: true },
  newScore: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('TrustHistory', trustHistorySchema);