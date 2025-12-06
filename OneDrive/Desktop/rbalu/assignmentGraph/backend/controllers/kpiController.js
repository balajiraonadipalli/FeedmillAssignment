const Batch = require('../models/Batch');
const Energy = require('../models/Energy');
const ProcessSignal = require('../models/ProcessSignal');
const Quality = require('../models/Quality');
const Silo = require('../models/Silo');
const Downtime = require('../models/Downtime');
const Bagging = require('../models/Bagging');
const Shipment = require('../models/Shipment');
const Weighment = require('../models/Weighment');
const SiloEvent = require('../models/SiloEvent');
const LineState = require('../models/LineState');
const KPICalculator = require('../utils/kpiCalculator');

const kpiController = {
  // Production KPIs
  async getProductionKPIs(req, res) {
    try {
      const { timeRange = 'wtd', product, line } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      let query = {
        start_time: { $gte: timeBounds.start, $lte: timeBounds.end }
      };

      if (product) query.product_id = product;
      if (line) query.line = line;

      const batches = await Batch.find(query);
      const production = KPICalculator.calculateProductionVsPlan(batches, timeBounds.start, timeBounds.end);

      res.json(production);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getProductionVsPlan(req, res) {
    try {
      const { timeRange = 'wtd', product, line } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      let query = {
        start_time: { $gte: timeBounds.start, $lte: timeBounds.end }
      };

      if (product) query.product_id = product;
      if (line) query.line = line;

      const batches = await Batch.find(query);
      const result = KPICalculator.calculateProductionVsPlan(batches, timeBounds.start, timeBounds.end);

      // Group by product and line
      const byProduct = {};
      const byLine = {};

      batches.forEach(batch => {
        const prod = batch.product_id || 'Unknown';
        const ln = batch.line || 'Unknown';

        byProduct[prod] = (byProduct[prod] || 0) + (batch.actual_mass_t || 0);
        byLine[ln] = (byLine[ln] || 0) + (batch.actual_mass_t || 0);
      });

      // Ensure byProduct and byLine are always objects (not undefined)
      const response = {
        ...result,
        byProduct: byProduct || {},
        byLine: byLine || {}
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Energy KPIs
  async getEnergyKPIs(req, res) {
    try {
      const { timeRange = 'wtd' } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      const energyData = await Energy.find({
        timestamp: { $gte: timeBounds.start, $lte: timeBounds.end },
        meter_id: 'EM-MAIN'
      }).sort({ timestamp: 1 });

      const batches = await Batch.find({
        start_time: { $gte: timeBounds.start, $lte: timeBounds.end }
      });
      const productionTons = batches.reduce((sum, b) => sum + (b.actual_mass_t || 0), 0);

      const sec = KPICalculator.calculateSEC(energyData, productionTons);
      const totalKWh = energyData.reduce((sum, e) => sum + (e.kWh || 0), 0);
      const avgPowerFactor = energyData.length > 0
        ? energyData.reduce((sum, e) => sum + (e.power_factor || 0), 0) / energyData.length
        : 0;

      const demandTrend = energyData.map(e => ({
        timestamp: e.timestamp,
        kW: e.kW || 0
      }));

      res.json({
        sec: Math.round(sec * 100) / 100,
        totalKWh: Math.round(totalKWh * 100) / 100,
        powerFactor: Math.round(avgPowerFactor * 100) / 100,
        demandTrend
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSEC(req, res) {
    try {
      const { timeRange = 'wtd' } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      const energyData = await Energy.find({
        timestamp: { $gte: timeBounds.start, $lte: timeBounds.end },
        meter_id: 'EM-MAIN'
      });

      const batches = await Batch.find({
        start_time: { $gte: timeBounds.start, $lte: timeBounds.end }
      });
      const productionTons = batches.reduce((sum, b) => sum + (b.actual_mass_t || 0), 0);

      const sec = KPICalculator.calculateSEC(energyData, productionTons);

      res.json({ sec: Math.round(sec * 100) / 100 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Steam KPIs
  async getSteamKPIs(req, res) {
    try {
      const { timeRange = 'wtd' } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      const steamSignals = await ProcessSignal.find({
        timestamp: { $gte: timeBounds.start, $lte: timeBounds.end },
        signal_name: { $in: ['steam_flow_kgph', 'conditioner_sp', 'conditioner_pv'] }
      }).sort({ timestamp: 1 });

      const batches = await Batch.find({
        start_time: { $gte: timeBounds.start, $lte: timeBounds.end }
      });
      const productionTons = batches.reduce((sum, b) => sum + (b.actual_mass_t || 0), 0);

      const steamPerTon = KPICalculator.calculateSteamPerTon(
        steamSignals,
        productionTons,
        timeBounds.start,
        timeBounds.end
      );

      // Conditioner stability
      const conditionerPV = steamSignals.filter(s => s.signal_name === 'conditioner_pv');
      const conditionerSP = steamSignals.filter(s => s.signal_name === 'conditioner_sp');

      let withinTolerance = 0;
      conditionerPV.forEach(pv => {
        const sp = conditionerSP.find(s => 
          Math.abs(new Date(s.timestamp) - new Date(pv.timestamp)) < 5 * 60 * 1000
        );
        if (sp && Math.abs(pv.value - sp.value) <= 2) {
          withinTolerance++;
        }
      });

      const stability = conditionerPV.length > 0
        ? (withinTolerance / conditionerPV.length) * 100
        : 0;

      // Generate trend data for steam per ton (5-min intervals)
      const steamFlowSignals = steamSignals.filter(s => s.signal_name === 'steam_flow_kgph');
      const trendData = [];
      const intervalMinutes = 5;
      let currentTime = new Date(timeBounds.start);
      
      while (currentTime <= timeBounds.end) {
        const intervalEnd = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
        const intervalSignals = steamFlowSignals.filter(s => {
          const signalTime = new Date(s.timestamp);
          return signalTime >= currentTime && signalTime < intervalEnd;
        });
        
        if (intervalSignals.length > 0) {
          const avgFlow = intervalSignals.reduce((sum, s) => sum + (s.value || 0), 0) / intervalSignals.length;
          // Calculate steam per ton for this interval (simplified - using average flow)
          const intervalProduction = batches.filter(b => {
            const batchTime = new Date(b.start_time);
            return batchTime >= currentTime && batchTime < intervalEnd;
          }).reduce((sum, b) => sum + (b.actual_mass_t || 0), 0);
          
          const intervalSteamPerTon = intervalProduction > 0 
            ? (avgFlow * (intervalMinutes / 60)) / intervalProduction 
            : 0;
          
          trendData.push({
            timestamp: currentTime.toISOString(),
            steamPerTon: Math.round(intervalSteamPerTon * 100) / 100,
            steamFlow: Math.round(avgFlow * 100) / 100
          });
        }
        
        currentTime = intervalEnd;
      }

      res.json({
        steamPerTon: Math.round(steamPerTon * 100) / 100,
        conditionerStability: Math.round(stability * 100) / 100,
        trend: trendData.slice(-24) // Last 24 intervals (2 hours of 5-min data)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSteamPerTon(req, res) {
    try {
      const { timeRange = 'wtd' } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      const steamSignals = await ProcessSignal.find({
        timestamp: { $gte: timeBounds.start, $lte: timeBounds.end },
        signal_name: 'steam_flow_kgph'
      }).sort({ timestamp: 1 });

      const batches = await Batch.find({
        start_time: { $gte: timeBounds.start, $lte: timeBounds.end }
      });
      const productionTons = batches.reduce((sum, b) => sum + (b.actual_mass_t || 0), 0);

      const steamPerTon = KPICalculator.calculateSteamPerTon(
        steamSignals,
        productionTons,
        timeBounds.start,
        timeBounds.end
      );

      res.json({ steamPerTon: Math.round(steamPerTon * 100) / 100 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Availability
  async getAvailability(req, res) {
    try {
      const { timeRange = 'wtd', line } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      let query = {
        timestamp: { $gte: timeBounds.start, $lte: timeBounds.end }
      };
      if (line) query.line = line;

      const lineStates = await LineState.find(query).sort({ timestamp: 1 });
      
      if (lineStates.length > 0) {
        const availability = KPICalculator.calculateAvailability(lineStates, timeBounds.start, timeBounds.end);
        const runCount = lineStates.filter(s => s.state === 'RUN').length;
        const totalCount = lineStates.length;
        const totalMinutes = (timeBounds.end - timeBounds.start) / (1000 * 60);
        const runMinutes = (runCount / totalCount) * totalMinutes;

        res.json({
          availability: Math.round(availability * 100) / 100,
          runMinutes: Math.round(runMinutes),
          totalMinutes: Math.round(totalMinutes)
        });
      } else {
        // Fallback to batch-based calculation
        const batchQuery = {
          start_time: { $gte: timeBounds.start, $lte: timeBounds.end }
        };
        if (line) batchQuery.line = line;

        const batches = await Batch.find(batchQuery);
        const totalMinutes = (timeBounds.end - timeBounds.start) / (1000 * 60);
        
        const runMinutes = batches.reduce((sum, b) => {
          if (b.start_time && b.end_time) {
            return sum + (new Date(b.end_time) - new Date(b.start_time)) / (1000 * 60);
          }
          return sum;
        }, 0);

        const availability = totalMinutes > 0 ? (runMinutes / totalMinutes) * 100 : 0;

        res.json({
          availability: Math.round(availability * 100) / 100,
          runMinutes: Math.round(runMinutes),
          totalMinutes: Math.round(totalMinutes)
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Quality KPIs
  async getQualityKPIs(req, res) {
    try {
      const { timeRange = 'wtd' } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      const qualityResults = await Quality.find({
        test_time: { $gte: timeBounds.start, $lte: timeBounds.end }
      });

      const fpy = KPICalculator.calculateFPY(qualityResults);

      res.json({
        fpy: Math.round(fpy * 100) / 100,
        pass: qualityResults.filter(q => q.result === 'PASS').length,
        hold: qualityResults.filter(q => q.result === 'HOLD').length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getHoldSamples(req, res) {
    try {
      const { limit = 10 } = req.query;

      const holdSamples = await Quality.find({ result: 'HOLD' })
        .sort({ test_time: -1 })
        .limit(parseInt(limit));

      res.json(holdSamples);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Recipe Adherence
  async getRecipeAdherence(req, res) {
    try {
      const { timeRange = 'wtd' } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      const weighments = await Weighment.find({
        timestamp: { $gte: timeBounds.start, $lte: timeBounds.end }
      });

      const adherence = KPICalculator.calculateRecipeAdherence(weighments);

      // Find worst ingredient
      const ingredientStats = {};
      weighments.forEach(w => {
        const ing = w.ingredient_name || w.ingredient_id || 'Unknown';
        if (!ingredientStats[ing]) {
          ingredientStats[ing] = { total: 0, within: 0 };
        }
        ingredientStats[ing].total++;
        const target = w.target_kg || 0;
        const actual = w.actual_kg || 0;
        const diff = Math.abs(actual - target);
        const percentDiff = target > 0 ? (diff / target) * 100 : 0;
        const isMacro = w.ingredient_type === 'macro';
        const threshold = isMacro ? 2 : 5;
        if (percentDiff <= threshold) {
          ingredientStats[ing].within++;
        }
      });

      const worstIngredient = Object.entries(ingredientStats)
        .map(([name, stats]) => ({
          name,
          adherence: stats.total > 0 ? (stats.within / stats.total) * 100 : 0
        }))
        .sort((a, b) => a.adherence - b.adherence)[0];

      res.json({
        adherence: Math.round(adherence.adherence * 100) / 100,
        total: adherence.total,
        within: adherence.within,
        worstIngredient: worstIngredient || null
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Silo KPIs
  async getSiloKPIs(req, res) {
    try {
      const latestSilos = await Silo.aggregate([
        { $sort: { timestamp: -1 } },
        { $group: {
          _id: '$silo_id',
          level_t: { $first: '$level_t' },
          capacity_t: { $first: '$capacity_t' },
          material: { $first: '$material' },
          timestamp: { $first: '$timestamp' }
        }}
      ]);

      // Calculate DOC (simplified - would need consumption data)
      const silosWithDOC = latestSilos.map(silo => ({
        ...silo,
        doc: silo.level_t > 0 ? (silo.level_t / 10) : 0, // Simplified calculation
        utilization: silo.capacity_t > 0 ? (silo.level_t / silo.capacity_t) * 100 : 0
      }));

      res.json(silosWithDOC);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSiloEvents(req, res) {
    try {
      const { limit = 10, eventType } = req.query;
      
      let query = {};
      if (eventType) {
        query.event_type = eventType;
      }

      const events = await SiloEvent.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit));

      res.json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Reliability KPIs
  async getReliabilityKPIs(req, res) {
    try {
      const { timeRange = 'wtd' } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      const downtimeEvents = await Downtime.find({
        start_time: { $gte: timeBounds.start, $lte: timeBounds.end }
      });

      const totalMinutes = (timeBounds.end - timeBounds.start) / (1000 * 60);
      const downtimePercentage = KPICalculator.calculateDowntimePercentage(downtimeEvents, totalMinutes);

      res.json({
        downtimePercentage: Math.round(downtimePercentage * 100) / 100,
        totalDowntimeMinutes: downtimeEvents.reduce((sum, d) => sum + (d.duration_minutes || 0), 0),
        eventCount: downtimeEvents.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getDowntimePareto(req, res) {
    try {
      const { timeRange = 'wtd' } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      const downtimeEvents = await Downtime.find({
        start_time: { $gte: timeBounds.start, $lte: timeBounds.end }
      });

      // Group by equipment
      const byEquipment = {};
      const byReason = {};

      downtimeEvents.forEach(event => {
        const eq = event.equipment || 'Unknown';
        const reason = event.reason || 'Unknown';

        byEquipment[eq] = (byEquipment[eq] || 0) + (event.duration_minutes || 0);
        byReason[reason] = (byReason[reason] || 0) + (event.duration_minutes || 0);
      });

      res.json({
        byEquipment: Object.entries(byEquipment)
          .sort((a, b) => b[1] - a[1])
          .map(([equipment, minutes]) => ({ equipment, minutes })),
        byReason: Object.entries(byReason)
          .sort((a, b) => b[1] - a[1])
          .map(([reason, minutes]) => ({ reason, minutes }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Packaging KPIs
  async getPackagingKPIs(req, res) {
    try {
      const { timeRange = 'wtd' } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      const baggingData = await Bagging.find({
        timestamp: { $gte: timeBounds.start, $lte: timeBounds.end }
      });

      const totalBags = baggingData.reduce((sum, b) => sum + (b.bag_count || 0), 0);
      const totalRework = baggingData.reduce((sum, b) => sum + (b.rework_count || 0), 0);
      const reworkPercentage = totalBags > 0 ? (totalRework / totalBags) * 100 : 0;

      res.json({
        bagCount: totalBags,
        reworkPercentage: Math.round(reworkPercentage * 100) / 100,
        totalRework: totalRework
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Dispatch KPIs
  async getDispatchKPIs(req, res) {
    try {
      const { timeRange = 'wtd' } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      const shipments = await Shipment.find({
        start_time: { $gte: timeBounds.start, $lte: timeBounds.end }
      });

      const turnAroundTimes = shipments
        .filter(s => s.start_time && s.end_time)
        .map(s => (new Date(s.end_time) - new Date(s.start_time)) / (1000 * 60)); // minutes

      const medianTAT = turnAroundTimes.length > 0
        ? turnAroundTimes.sort((a, b) => a - b)[Math.floor(turnAroundTimes.length / 2)]
        : 0;

      const avgLoadingRate = shipments.length > 0
        ? shipments.reduce((sum, s) => sum + (s.loading_rate_tph || 0), 0) / shipments.length
        : 0;

      res.json({
        truckTAT: Math.round(medianTAT * 100) / 100,
        loadingRate: Math.round(avgLoadingRate * 100) / 100,
        shipmentCount: shipments.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = kpiController;

