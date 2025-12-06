import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { kpiService } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { tilePaperStyle, tileTitleStyle, tileValueStyle, loadingPaperStyle } from '../../utils/tileStyles';

const EnergyTile = () => {
  const { filters } = useFilters();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    kpiService.getEnergyKPIs(filters)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching energy data:', err);
        setLoading(false);
      });
  }, [filters]);

  if (loading) {
    return (
      <Paper elevation={0} sx={loadingPaperStyle}>
        <Typography variant="h6" gutterBottom>Energy</Typography>
        <LinearProgress />
      </Paper>
    );
  }

  if (!data) return null;

  const demandData = (data.demandTrend || []).slice(-20).map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    kW: Math.round(item.kW * 100) / 100,
  }));

  return (
    <Paper elevation={0} sx={tilePaperStyle}>
      <Typography variant="h6" sx={tileTitleStyle}>Energy</Typography>
      
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={tileValueStyle}>
          {data.sec || 0} kWh/t
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          SEC (Specific Energy Consumption)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`PF: ${(data.powerFactor || 0).toFixed(2)}`}
            size="small"
            sx={{
              background: 'rgba(66, 165, 245, 0.2)',
              border: '1px solid rgba(66, 165, 245, 0.3)',
              color: '#42a5f5',
            }}
          />
          <Chip
            label={`Total: ${(data.totalKWh || 0).toFixed(0)} kWh`}
            size="small"
            sx={{
              background: 'rgba(0, 212, 255, 0.2)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#00d4ff',
            }}
          />
        </Box>
      </Box>

      {demandData.length > 0 && (
        <Box sx={{ height: 200 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.7rem' }}>
            Site Demand (kW)
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={demandData}>
              <defs>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.5)" fontSize={10} />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={10} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(22, 27, 34, 0.95)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: 4,
                }}
              />
              <Area
                type="monotone"
                dataKey="kW"
                stroke="#00d4ff"
                strokeWidth={2}
                fill="url(#energyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default EnergyTile;

