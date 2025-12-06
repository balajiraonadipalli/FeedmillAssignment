const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Get all data for a specific time range
router.get('/filtered', dataController.getFilteredData);

// Get products
router.get('/products', dataController.getProducts);

// Get lines
router.get('/lines', dataController.getLines);

// Get time ranges
router.get('/time-ranges', dataController.getTimeRanges);

module.exports = router;

