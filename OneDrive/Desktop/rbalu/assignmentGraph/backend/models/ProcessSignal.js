const mongoose = require('mongoose');

const processSignalSchema = new mongoose.Schema({
  timestamp: Date,
  signal_name: String,
  value: Number,
  unit: String
}, { timestamps: true });

processSignalSchema.index({ timestamp: 1, signal_name: 1 });

module.exports = mongoose.model('ProcessSignal', processSignalSchema);

