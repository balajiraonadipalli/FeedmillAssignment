const mongoose = require('mongoose');

const weighmentSchema = new mongoose.Schema({
  batch_id: String,
  ingredient_id: String,
  ingredient_name: String,
  ingredient_type: String, // 'macro' or 'micro'
  target_kg: Number,
  actual_kg: Number,
  operator: String,
  timestamp: Date
}, { timestamps: true });

weighmentSchema.index({ batch_id: 1, timestamp: 1 });

module.exports = mongoose.model('Weighment', weighmentSchema);

