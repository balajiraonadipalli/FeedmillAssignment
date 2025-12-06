const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Import models
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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/feedmill';

// Generate random date within range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate test data
async function generateTestData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await Batch.deleteMany({});
    await Energy.deleteMany({});
    await ProcessSignal.deleteMany({});
    await Silo.deleteMany({});
    await Quality.deleteMany({});
    await Downtime.deleteMany({});
    await Bagging.deleteMany({});
    await Shipment.deleteMany({});
    await Weighment.deleteMany({});
    await SiloEvent.deleteMany({});
    await LineState.deleteMany({});

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Products
    console.log('Generating products...');
    const products = [
      { product_id: 'P001', product_name: 'Chicken Feed Premium', product_code: 'CFP', line: 'Line1', planned_daily_t: 25, category: 'Poultry' },
      { product_id: 'P002', product_name: 'Cattle Feed Standard', product_code: 'CFS', line: 'Line1', planned_daily_t: 30, category: 'Cattle' },
      { product_id: 'P003', product_name: 'Fish Feed Pellet', product_code: 'FFP', line: 'Line2', planned_daily_t: 20, category: 'Aqua' },
    ];
    await Product.insertMany(products);
    console.log(`Created ${products.length} products`);

    // 2. Batches (last 7 days)
    console.log('Generating batches...');
    const batches = [];
    for (let i = 0; i < 50; i++) {
      const startTime = randomDate(weekAgo, now);
      const duration = 30 + Math.random() * 60; // 30-90 minutes
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      const product = products[Math.floor(Math.random() * products.length)];
      
      batches.push({
        batch_id: `B${String(i + 1).padStart(4, '0')}`,
        order_id: `O${String(Math.floor(i / 3) + 1).padStart(4, '0')}`,
        product_id: product.product_id,
        line: product.line,
        start_time: startTime,
        end_time: endTime,
        actual_mass_t: 2 + Math.random() * 3, // 2-5 tons
        planned_mass_t: 2.5 + Math.random() * 2.5, // 2.5-5 tons
        status: 'COMPLETED',
      });
    }
    await Batch.insertMany(batches);
    console.log(`Created ${batches.length} batches`);

    // 3. Energy data (15-min intervals)
    console.log('Generating energy data...');
    const energyData = [];
    for (let d = new Date(weekAgo); d <= now; d.setMinutes(d.getMinutes() + 15)) {
      energyData.push({
        timestamp: new Date(d),
        meter_id: 'EM-MAIN',
        kWh: 50 + Math.random() * 100, // 50-150 kWh
        kW: 200 + Math.random() * 100, // 200-300 kW
        power_factor: 0.85 + Math.random() * 0.1, // 0.85-0.95
      });
    }
    await Energy.insertMany(energyData);
    console.log(`Created ${energyData.length} energy records`);

    // 4. Process Signals (5-min intervals)
    console.log('Generating process signals...');
    const signals = [];
    for (let d = new Date(weekAgo); d <= now; d.setMinutes(d.getMinutes() + 5)) {
      signals.push(
        {
          timestamp: new Date(d),
          signal_name: 'steam_flow_kgph',
          value: 200 + Math.random() * 100, // 200-300 kg/h
          unit: 'kg/h',
        },
        {
          timestamp: new Date(d),
          signal_name: 'conditioner_sp',
          value: 85 + Math.random() * 5, // 85-90°C
          unit: '°C',
        },
        {
          timestamp: new Date(d),
          signal_name: 'conditioner_pv',
          value: 84 + Math.random() * 6, // 84-90°C
          unit: '°C',
        }
      );
    }
    await ProcessSignal.insertMany(signals);
    console.log(`Created ${signals.length} process signals`);

    // 5. Silo Levels
    console.log('Generating silo data...');
    const silos = [
      { silo_id: 'SILO-01', material: 'Corn', level_t: 45, capacity_t: 100 },
      { silo_id: 'SILO-02', material: 'Soybean', level_t: 32, capacity_t: 100 },
      { silo_id: 'SILO-03', material: 'Wheat', level_t: 28, capacity_t: 100 },
      { silo_id: 'SILO-04', material: 'Premix', level_t: 15, capacity_t: 50 },
    ];
    for (const silo of silos) {
      for (let d = new Date(weekAgo); d <= now; d.setDate(d.getDate() + 1)) {
        await Silo.create({
          timestamp: new Date(d),
          silo_id: silo.silo_id,
          material: silo.material,
          level_t: silo.level_t + (Math.random() - 0.5) * 5, // slight variation
          capacity_t: silo.capacity_t,
        });
      }
    }
    console.log(`Created silo level records`);

    // 6. Quality Results
    console.log('Generating quality data...');
    const qualityResults = [];
    batches.forEach(batch => {
      qualityResults.push({
        batch_id: batch.batch_id,
        product_id: batch.product_id,
        test_time: new Date(batch.end_time.getTime() + 10 * 60 * 1000), // 10 min after batch
        result: Math.random() > 0.15 ? 'PASS' : 'HOLD', // 85% pass rate
        notes: Math.random() > 0.15 ? null : 'Moisture slightly high',
      });
    });
    await Quality.insertMany(qualityResults);
    console.log(`Created ${qualityResults.length} quality results`);

    // 7. Downtime Events
    console.log('Generating downtime data...');
    const downtimeEvents = [];
    for (let i = 0; i < 10; i++) {
      const startTime = randomDate(weekAgo, now);
      const duration = 15 + Math.random() * 45; // 15-60 minutes
      downtimeEvents.push({
        start_time: startTime,
        end_time: new Date(startTime.getTime() + duration * 60 * 1000),
        equipment: ['Pellet Mill', 'Mixer', 'Conditioner', 'Bagging Line'][Math.floor(Math.random() * 4)],
        reason: ['Mechanical', 'Electrical', 'Maintenance', 'Material'][Math.floor(Math.random() * 4)],
        line: ['Line1', 'Line2'][Math.floor(Math.random() * 2)],
        duration_minutes: duration,
      });
    }
    await Downtime.insertMany(downtimeEvents);
    console.log(`Created ${downtimeEvents.length} downtime events`);

    // 8. Bagging Data
    console.log('Generating bagging data...');
    const baggingData = [];
    batches.slice(0, 30).forEach(batch => {
      baggingData.push({
        timestamp: new Date(batch.end_time.getTime() + 5 * 60 * 1000),
        batch_id: batch.batch_id,
        product_id: batch.product_id,
        bag_count: 80 + Math.floor(Math.random() * 40), // 80-120 bags
        rework_count: Math.floor(Math.random() * 5), // 0-5 rework
        bag_weight_kg: 25,
        line: batch.line,
      });
    });
    await Bagging.insertMany(baggingData);
    console.log(`Created ${baggingData.length} bagging records`);

    // 9. Shipments
    console.log('Generating shipment data...');
    const shipments = [];
    for (let i = 0; i < 20; i++) {
      const startTime = randomDate(weekAgo, now);
      const loadingTime = 20 + Math.random() * 40; // 20-60 minutes
      shipments.push({
        shipment_id: `SH${String(i + 1).padStart(4, '0')}`,
        order_id: batches[Math.floor(Math.random() * batches.length)].order_id,
        product_id: products[Math.floor(Math.random() * products.length)].product_id,
        start_time: startTime,
        end_time: new Date(startTime.getTime() + loadingTime * 60 * 1000),
        net_weight_t: 5 + Math.random() * 10, // 5-15 tons
        truck_id: `TRUCK-${String(i + 1).padStart(3, '0')}`,
        loading_rate_tph: 10 + Math.random() * 10, // 10-20 t/h
      });
    }
    await Shipment.insertMany(shipments);
    console.log(`Created ${shipments.length} shipments`);

    // 10. Weighments
    console.log('Generating weighment data...');
    const weighments = [];
    batches.forEach(batch => {
      const ingredients = [
        { name: 'Corn', type: 'macro', target: 500 },
        { name: 'Soybean', type: 'macro', target: 300 },
        { name: 'Wheat', type: 'macro', target: 150 },
        { name: 'Premix', type: 'micro', target: 50 },
      ];
      ingredients.forEach(ing => {
        weighments.push({
          batch_id: batch.batch_id,
          ingredient_id: ing.name.substring(0, 3).toUpperCase(),
          ingredient_name: ing.name,
          ingredient_type: ing.type,
          target_kg: ing.target,
          actual_kg: ing.target * (0.98 + Math.random() * 0.04), // ±2% variation
          operator: `OP${Math.floor(Math.random() * 5) + 1}`,
          timestamp: new Date(batch.start_time.getTime() + Math.random() * 10 * 60 * 1000),
        });
      });
    });
    await Weighment.insertMany(weighments);
    console.log(`Created ${weighments.length} weighments`);

    // 11. Line States (5-min intervals)
    console.log('Generating line state data...');
    const lineStates = [];
    for (let d = new Date(weekAgo); d <= now; d.setMinutes(d.getMinutes() + 5)) {
      ['Line1', 'Line2'].forEach(line => {
        lineStates.push({
          timestamp: new Date(d),
          line: line,
          state: Math.random() > 0.2 ? 'RUN' : (Math.random() > 0.5 ? 'IDLE' : 'STOP'),
          product_id: products[Math.floor(Math.random() * products.length)].product_id,
          batch_id: batches[Math.floor(Math.random() * batches.length)].batch_id,
        });
      });
    }
    await LineState.insertMany(lineStates);
    console.log(`Created ${lineStates.length} line state records`);

    // 12. Silo Events
    console.log('Generating silo events...');
    const siloEvents = [];
    for (let i = 0; i < 15; i++) {
      const eventTime = randomDate(weekAgo, now);
      const silo = silos[Math.floor(Math.random() * silos.length)];
      siloEvents.push({
        timestamp: eventTime,
        silo_id: silo.silo_id,
        event_type: Math.random() > 0.7 ? 'LOW_LEVEL' : 'CHANGEOVER',
        material: silo.material,
        level_t: silo.level_t,
        order_id: batches[Math.floor(Math.random() * batches.length)].order_id,
        batch_id: batches[Math.floor(Math.random() * batches.length)].batch_id,
        notes: Math.random() > 0.7 ? 'Low level warning' : 'Material changeover',
      });
    }
    await SiloEvent.insertMany(siloEvents);
    console.log(`Created ${siloEvents.length} silo events`);

    console.log('\nTest data generation completed successfully!');
    console.log('\nSummary:');
    console.log(`- Products: ${products.length}`);
    console.log(`- Batches: ${batches.length}`);
    console.log(`- Energy records: ${energyData.length}`);
    console.log(`- Process signals: ${signals.length}`);
    console.log(`- Quality results: ${qualityResults.length}`);
    console.log(`- Downtime events: ${downtimeEvents.length}`);
    console.log(`- Bagging records: ${baggingData.length}`);
    console.log(`- Shipments: ${shipments.length}`);
    console.log(`- Weighments: ${weighments.length}`);
    console.log(`- Line states: ${lineStates.length}`);
    console.log(`- Silo events: ${siloEvents.length}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error generating test data:', error);
    process.exit(1);
  }
}

generateTestData();

