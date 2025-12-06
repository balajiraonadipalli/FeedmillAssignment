import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// KPI endpoints
export const kpiService = {
  // Production
  getProductionKPIs: (params) => api.get('/kpis/production', { params }),
  getProductionVsPlan: (params) => api.get('/kpis/production-vs-plan', { params }),

  // Energy
  getEnergyKPIs: (params) => api.get('/kpis/energy', { params }),
  getSEC: (params) => api.get('/kpis/energy/sec', { params }),

  // Steam
  getSteamKPIs: (params) => api.get('/kpis/steam', { params }),
  getSteamPerTon: (params) => api.get('/kpis/steam/per-ton', { params }),

  // Availability
  getAvailability: (params) => api.get('/kpis/availability', { params }),

  // Quality
  getQualityKPIs: (params) => api.get('/kpis/quality', { params }),
  getHoldSamples: (params) => api.get('/kpis/quality/hold-samples', { params }),

  // Recipe
  getRecipeAdherence: (params) => api.get('/kpis/recipe', { params }),

  // Silos
  getSiloKPIs: (params) => api.get('/kpis/silos', { params }),
  getSiloEvents: (params) => api.get('/kpis/silos/events', { params }),

  // Reliability
  getReliabilityKPIs: (params) => api.get('/kpis/reliability', { params }),
  getDowntimePareto: (params) => api.get('/kpis/reliability/downtime', { params }),

  // Packaging & Dispatch
  getPackagingKPIs: (params) => api.get('/kpis/packaging', { params }),
  getDispatchKPIs: (params) => api.get('/kpis/dispatch', { params }),
};

// Data endpoints
export const dataService = {
  getProducts: () => api.get('/data/products'),
  getLines: () => api.get('/data/lines'),
};

// Upload endpoints
export const uploadService = {
  uploadXLSX: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/xlsx', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadCSV: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post('/upload/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;

