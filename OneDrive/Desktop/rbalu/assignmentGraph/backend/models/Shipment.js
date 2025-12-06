const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  shipment_id: String,
  order_id: String,
  product_id: String,
  start_time: Date,
  end_time: Date,
  net_weight_t: Number,
  truck_id: String,
  loading_rate_tph: Number
}, { timestamps: true });

shipmentSchema.index({ start_time: 1, order_id: 1 });

module.exports = mongoose.model('Shipment', shipmentSchema);

