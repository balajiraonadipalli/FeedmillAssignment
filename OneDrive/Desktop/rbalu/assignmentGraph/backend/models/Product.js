const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_id: String,
  product_name: String,
  product_code: String,
  line: String,
  planned_daily_t: Number,
  category: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

