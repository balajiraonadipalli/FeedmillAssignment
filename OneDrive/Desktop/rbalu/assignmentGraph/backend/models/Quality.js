const mongoose = require('mongoose');

const qualitySchema = new mongoose.Schema({
  batch_id: String,
  product_id: String,
  test_time: Date,
  result: String, // PASS, HOLD
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Quality', qualitySchema);

