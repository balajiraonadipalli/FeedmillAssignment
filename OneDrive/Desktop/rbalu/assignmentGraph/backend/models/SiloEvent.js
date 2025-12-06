const mongoose = require('mongoose');

const siloEventSchema = new mongoose.Schema({
  timestamp: Date,
  silo_id: String,
  event_type: String, // 'LOW_LEVEL', 'CHANGEOVER', etc.
  material: String,
  level_t: Number,
  order_id: String,
  batch_id: String,
  notes: String
}, { timestamps: true });

siloEventSchema.index({ timestamp: 1, silo_id: 1, event_type: 1 });

module.exports = mongoose.model('SiloEvent', siloEventSchema);

