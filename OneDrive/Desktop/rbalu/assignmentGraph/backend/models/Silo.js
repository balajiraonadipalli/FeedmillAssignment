const mongoose = require('mongoose');

const siloSchema = new mongoose.Schema({
  timestamp: Date,
  silo_id: String,
  material: String,
  level_t: Number,
  capacity_t: Number
}, { timestamps: true });

siloSchema.index({ timestamp: 1, silo_id: 1 });

module.exports = mongoose.model('Silo', siloSchema);

