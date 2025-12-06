const mongoose = require('mongoose');

const lineStateSchema = new mongoose.Schema({
  timestamp: Date,
  line: String,
  state: String, // 'RUN', 'STOP', 'IDLE', etc.
  product_id: String,
  batch_id: String
}, { timestamps: true });

lineStateSchema.index({ timestamp: 1, line: 1 });

module.exports = mongoose.model('LineState', lineStateSchema);

