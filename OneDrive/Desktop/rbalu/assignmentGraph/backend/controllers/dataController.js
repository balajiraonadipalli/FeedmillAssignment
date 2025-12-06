const Product = require('../models/Product');
const Batch = require('../models/Batch');
const KPICalculator = require('../utils/kpiCalculator');

const dataController = {
  async getFilteredData(req, res) {
    try {
      const { timeRange = 'wtd', product, line } = req.query;
      const timeBounds = KPICalculator.getTimeRange(timeRange);

      let batchQuery = {
        start_time: { $gte: timeBounds.start, $lte: timeBounds.end }
      };

      if (product) batchQuery.product_id = product;
      if (line) batchQuery.line = line;

      const batches = await Batch.find(batchQuery);

      res.json({
        timeRange,
        filters: { product, line },
        batches: batches.length,
        data: batches
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getProducts(req, res) {
    try {
      const products = await Product.find({});
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getLines(req, res) {
    try {
      const batches = await Batch.distinct('line');
      res.json(batches.filter(l => l));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getTimeRanges(req, res) {
    res.json([
      { value: 'today', label: 'Today' },
      { value: 'yesterday', label: 'Yesterday' },
      { value: 'wtd', label: 'Week to Date' },
      { value: 'mtd', label: 'Month to Date' }
    ]);
  }
};

module.exports = dataController;

