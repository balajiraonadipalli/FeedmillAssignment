import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { kpiService } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { tilePaperStyle, tileTitleStyle, tileValueStyle, loadingPaperStyle } from '../../utils/tileStyles';

const ReliabilityTile = () => {
  const { filters } = useFilters();
  const [data, setData] = useState(null);
  const [pareto, setPareto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      kpiService.getReliabilityKPIs(filters),
      kpiService.getDowntimePareto(filters),
    ])
      .then(([kpiRes, paretoRes]) => {
        setData(kpiRes.data);
        setPareto(paretoRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching reliability data:', err);
        setLoading(false);
      });
  }, [filters]);

  if (loading) {
    return (
      <Paper elevation={0} sx={loadingPaperStyle}>
        <Typography variant="h6" gutterBottom>Reliability</Typography>
        <LinearProgress />
      </Paper>
    );
  }

  if (!data) return null;

  const paretoData = (pareto?.byEquipment || []).slice(0, 5).map(item => ({
    name: item.equipment.length > 10 ? item.equipment.substring(0, 10) + '...' : item.equipment,
    minutes: Math.round(item.minutes),
  }));

  return (
    <Paper elevation={0} sx={tilePaperStyle}>
      <Typography variant="h6" sx={tileTitleStyle}>Reliability</Typography>
      
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="h4"
          sx={{
            ...tileValueStyle,
            background: 'linear-gradient(135deg, #ff5252 0%, #f44336 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {Math.round(data.downtimePercentage * 100) / 100}%
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Downtime Percentage
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Total: {Math.round(data.totalDowntimeMinutes || 0)} min | Events: {data.eventCount || 0}
        </Typography>
      </Box>

      {paretoData.length > 0 && (
        <Box sx={{ height: 200 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.7rem' }}>
            Downtime by Equipment (Top 5)
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paretoData}>
              <defs>
                <linearGradient id="reliabilityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5252" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#f44336" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" fontSize={10} />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={10} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(22, 27, 34, 0.95)',
                  border: '1px solid rgba(255, 82, 82, 0.3)',
                  borderRadius: 4,
                }}
              />
              <Bar dataKey="minutes" fill="url(#reliabilityGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default ReliabilityTile;

