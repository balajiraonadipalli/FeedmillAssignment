const mongoose = require('mongoose');

const baggingSchema = new mongoose.Schema({
  timestamp: Date,
  batch_id: String,
  product_id: String,
  bag_count: Number,
  rework_count: Number,
  bag_weight_kg: Number,
  line: String
}, { timestamps: true });

baggingSchema.index({ timestamp: 1, batch_id: 1 });

module.exports = mongoose.model('Bagging', baggingSchema);

