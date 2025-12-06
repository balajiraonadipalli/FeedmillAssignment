const mongoose = require('mongoose');

const energySchema = new mongoose.Schema({
  timestamp: Date,
  meter_id: String,
  kWh: Number,
  kW: Number,
  power_factor: Number
}, { timestamps: true });

energySchema.index({ timestamp: 1, meter_id: 1 });

module.exports = mongoose.model('Energy', energySchema);

