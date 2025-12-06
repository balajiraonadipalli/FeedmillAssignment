const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batch_id: String,
  order_id: String,
  product_id: String,
  line: String,
  start_time: Date,
  end_time: Date,
  actual_mass_t: Number,
  planned_mass_t: Number,
  status: String
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);

