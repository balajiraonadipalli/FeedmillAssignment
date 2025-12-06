const DataParser = require('../utils/dataParser');
const Product = require('../models/Product');
const Batch = require('../models/Batch');
const Energy = require('../models/Energy');
const ProcessSignal = require('../models/ProcessSignal');
const Silo = require('../models/Silo');
const Quality = require('../models/Quality');
const Downtime = require('../models/Downtime');
const Bagging = require('../models/Bagging');
const Shipment = require('../models/Shipment');
const Weighment = require('../models/Weighment');
const SiloEvent = require('../models/SiloEvent');
const LineState = require('../models/LineState');
const path = require('path');
const fs = require('fs');

const uploadController = {
  async uploadXLSX(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const sheets = DataParser.parseXLSX(filePath);

      // Import each sheet
      const results = {};

      // Products
      if (sheets.products) {
        const products = sheets.products.map(p => ({
          product_id: p.product_id,
          product_name: p.product_name,
          product_code: p.product_code,
          line: p.line,
          planned_daily_t: DataParser.convertNumber(p.planned_daily_t),
          category: p.category
        }));
        await Product.insertMany(products, { ordered: false }).catch(() => {});
        results.products = products.length;
      }

      // Batches
      if (sheets.batches) {
        const batches = sheets.batches.map(b => ({
          batch_id: b.batch_id,
          order_id: b.order_id,
          product_id: b.product_id,
          line: b.line,
          start_time: DataParser.convertDate(b.start_time),
          end_time: DataParser.convertDate(b.end_time),
          actual_mass_t: DataParser.convertNumber(b.actual_mass_t),
          planned_mass_t: DataParser.convertNumber(b.planned_mass_t),
          status: b.status
        }));
        await Batch.insertMany(batches, { ordered: false }).catch(() => {});
        results.batches = batches.length;
      }

      // Energy
      if (sheets.energy_meters_15min) {
        const energy = sheets.energy_meters_15min.map(e => ({
          timestamp: DataParser.convertDate(e.timestamp),
          meter_id: e.meter_id,
          kWh: DataParser.convertNumber(e.kWh),
          kW: DataParser.convertNumber(e.kW),
          power_factor: DataParser.convertNumber(e.power_factor)
        }));
        await Energy.insertMany(energy, { ordered: false }).catch(() => {});
        results.energy = energy.length;
      }

      // Process Signals
      if (sheets.process_signals_5min) {
        const signals = sheets.process_signals_5min.map(s => ({
          timestamp: DataParser.convertDate(s.timestamp),
          signal_name: s.signal_name,
          value: DataParser.convertNumber(s.value),
          unit: s.unit
        }));
        await ProcessSignal.insertMany(signals, { ordered: false }).catch(() => {});
        results.processSignals = signals.length;
      }

      // Silos
      if (sheets.silo_levels_15min) {
        const silos = sheets.silo_levels_15min.map(s => ({
          timestamp: DataParser.convertDate(s.timestamp),
          silo_id: s.silo_id,
          material: s.material,
          level_t: DataParser.convertNumber(s.level_t),
          capacity_t: DataParser.convertNumber(s.capacity_t)
        }));
        await Silo.insertMany(silos, { ordered: false }).catch(() => {});
        results.silos = silos.length;
      }

      // Quality
      if (sheets.quality_results) {
        const quality = sheets.quality_results.map(q => ({
          batch_id: q.batch_id,
          product_id: q.product_id,
          test_time: DataParser.convertDate(q.test_time),
          result: q.result,
          notes: q.notes
        }));
        await Quality.insertMany(quality, { ordered: false }).catch(() => {});
        results.quality = quality.length;
      }

      // Downtime
      if (sheets.downtime_events) {
        const downtime = sheets.downtime_events.map(d => ({
          start_time: DataParser.convertDate(d.start_time),
          end_time: DataParser.convertDate(d.end_time),
          equipment: d.equipment,
          reason: d.reason,
          line: d.line,
          duration_minutes: DataParser.convertNumber(d.duration_minutes)
        }));
        await Downtime.insertMany(downtime, { ordered: false }).catch(() => {});
        results.downtime = downtime.length;
      }

      // Bagging
      if (sheets.bagging) {
        const bagging = sheets.bagging.map(b => ({
          timestamp: DataParser.convertDate(b.timestamp),
          batch_id: b.batch_id,
          product_id: b.product_id,
          bag_count: DataParser.convertNumber(b.bag_count),
          rework_count: DataParser.convertNumber(b.rework_count),
          bag_weight_kg: DataParser.convertNumber(b.bag_weight_kg),
          line: b.line
        }));
        await Bagging.insertMany(bagging, { ordered: false }).catch(() => {});
        results.bagging = bagging.length;
      }

      // Shipments
      if (sheets.shipments) {
        const shipments = sheets.shipments.map(s => ({
          shipment_id: s.shipment_id,
          order_id: s.order_id,
          product_id: s.product_id,
          start_time: DataParser.convertDate(s.start_time),
          end_time: DataParser.convertDate(s.end_time),
          net_weight_t: DataParser.convertNumber(s.net_weight_t),
          truck_id: s.truck_id,
          loading_rate_tph: DataParser.convertNumber(s.loading_rate_tph)
        }));
        await Shipment.insertMany(shipments, { ordered: false }).catch(() => {});
        results.shipments = shipments.length;
      }

      // Weighments
      if (sheets.batch_weighments) {
        const weighments = sheets.batch_weighments.map(w => ({
          batch_id: w.batch_id,
          ingredient_id: w.ingredient_id,
          ingredient_name: w.ingredient_name,
          ingredient_type: w.ingredient_type,
          target_kg: DataParser.convertNumber(w.target_kg),
          actual_kg: DataParser.convertNumber(w.actual_kg),
          operator: w.operator,
          timestamp: DataParser.convertDate(w.timestamp)
        }));
        await Weighment.insertMany(weighments, { ordered: false }).catch(() => {});
        results.weighments = weighments.length;
      }

      // Silo Events
      if (sheets.silo_events) {
        const siloEvents = sheets.silo_events.map(e => ({
          timestamp: DataParser.convertDate(e.timestamp),
          silo_id: e.silo_id,
          event_type: e.event_type,
          material: e.material,
          level_t: DataParser.convertNumber(e.level_t),
          order_id: e.order_id,
          batch_id: e.batch_id,
          notes: e.notes
        }));
        await SiloEvent.insertMany(siloEvents, { ordered: false }).catch(() => {});
        results.siloEvents = siloEvents.length;
      }

      // Line States
      if (sheets.line_states_5min) {
        const lineStates = sheets.line_states_5min.map(s => ({
          timestamp: DataParser.convertDate(s.timestamp),
          line: s.line,
          state: s.state,
          product_id: s.product_id,
          batch_id: s.batch_id
        }));
        await LineState.insertMany(lineStates, { ordered: false }).catch(() => {});
        results.lineStates = lineStates.length;
      }

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        message: 'Data imported successfully',
        results
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async uploadCSV(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const results = {};

      for (const file of req.files) {
        const filePath = file.path;
        const fileName = path.basename(file.name, path.extname(file.name));
        const data = await DataParser.parseCSV(filePath);

        // Route to appropriate model based on filename
        switch (fileName) {
          case 'products':
            const products = data.map(p => ({
              product_id: p.product_id,
              product_name: p.product_name,
              product_code: p.product_code,
              line: p.line,
              planned_daily_t: DataParser.convertNumber(p.planned_daily_t),
              category: p.category
            }));
            await Product.insertMany(products, { ordered: false }).catch(() => {});
            results.products = products.length;
            break;

          case 'batches':
            const batches = data.map(b => ({
              batch_id: b.batch_id,
              order_id: b.order_id,
              product_id: b.product_id,
              line: b.line,
              start_time: DataParser.convertDate(b.start_time),
              end_time: DataParser.convertDate(b.end_time),
              actual_mass_t: DataParser.convertNumber(b.actual_mass_t),
              planned_mass_t: DataParser.convertNumber(b.planned_mass_t),
              status: b.status
            }));
            await Batch.insertMany(batches, { ordered: false }).catch(() => {});
            results.batches = batches.length;
            break;

          // Add more cases as needed
        }

        fs.unlinkSync(filePath);
      }

      res.json({
        message: 'CSV files imported successfully',
        results
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = uploadController;

