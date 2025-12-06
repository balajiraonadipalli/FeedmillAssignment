const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');

// Production KPIs
router.get('/production', kpiController.getProductionKPIs);
router.get('/production-vs-plan', kpiController.getProductionVsPlan);

// Energy KPIs
router.get('/energy', kpiController.getEnergyKPIs);
router.get('/energy/sec', kpiController.getSEC);

// Steam & Conditioning
router.get('/steam', kpiController.getSteamKPIs);
router.get('/steam/per-ton', kpiController.getSteamPerTon);

// Availability
router.get('/availability', kpiController.getAvailability);

// Quality (FPY)
router.get('/quality', kpiController.getQualityKPIs);
router.get('/quality/hold-samples', kpiController.getHoldSamples);

// Recipe Adherence
router.get('/recipe', kpiController.getRecipeAdherence);

// Silos / Materials
router.get('/silos', kpiController.getSiloKPIs);
router.get('/silos/events', kpiController.getSiloEvents);

// Reliability
router.get('/reliability', kpiController.getReliabilityKPIs);
router.get('/reliability/downtime', kpiController.getDowntimePareto);

// Packaging / Dispatch
router.get('/packaging', kpiController.getPackagingKPIs);
router.get('/dispatch', kpiController.getDispatchKPIs);

module.exports = router;

