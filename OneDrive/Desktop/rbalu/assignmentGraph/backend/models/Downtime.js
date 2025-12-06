const mongoose = require('mongoose');

const downtimeSchema = new mongoose.Schema({
  start_time: Date,
  end_time: Date,
  equipment: String,
  reason: String,
  line: String,
  duration_minutes: Number
}, { timestamps: true });

module.exports = mongoose.model('Downtime', downtimeSchema);

