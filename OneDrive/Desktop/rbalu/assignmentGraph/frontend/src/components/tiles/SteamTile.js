import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { kpiService } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { tilePaperStyle, tileTitleStyle, tileValueStyle, loadingPaperStyle } from '../../utils/tileStyles';

const SteamTile = () => {
  const { filters } = useFilters();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    kpiService.getSteamKPIs(filters)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching steam data:', err);
        setLoading(false);
      });
  }, [filters]);

  if (loading) {
    return (
      <Paper elevation={0} sx={loadingPaperStyle}>
        <Typography variant="h6" gutterBottom>Steam & Conditioning</Typography>
        <LinearProgress />
      </Paper>
    );
  }

  if (!data) return null;

  const stability = data.conditionerStability || 0;
  const stabilityColor = stability >= 95 ? 'success' : stability >= 80 ? 'warning' : 'error';

  // Prepare trend data for chart
  const trendData = (data.trend || []).map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    steamPerTon: item.steamPerTon || 0,
  }));

  return (
    <Paper elevation={0} sx={tilePaperStyle}>
      <Typography variant="h6" sx={tileTitleStyle}>Steam & Conditioning</Typography>
      
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={tileValueStyle}>
          {data.steamPerTon || 0} kg/t
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Steam per Ton
        </Typography>
      </Box>

      {/* Steam per Ton Trend Chart */}
      {trendData.length > 0 && (
        <Box sx={{ height: 120, mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.7rem' }}>
            Steam per Ton Trend (5-min intervals)
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <defs>
                <linearGradient id="steamGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9c27b0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="time" 
                stroke="rgba(255, 255, 255, 0.5)" 
                fontSize={10}
                interval="preserveStartEnd"
              />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={10} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(22, 27, 34, 0.95)',
                  border: '1px solid rgba(156, 39, 176, 0.3)',
                  borderRadius: 4,
                }}
              />
              <Line
                type="monotone"
                dataKey="steamPerTon"
                stroke="#9c27b0"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Conditioner Stability
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: `${stabilityColor}.main`,
            }}
          >
            {Math.round(stability * 100) / 100}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={stability}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              background: stability >= 95
                ? 'linear-gradient(90deg, #66bb6a 0%, #00e676 100%)'
                : stability >= 80
                ? 'linear-gradient(90deg, #ffb74d 0%, #ffa726 100%)'
                : 'linear-gradient(90deg, #ff5252 0%, #f44336 100%)',
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.7rem' }}>
          SP vs PV within ±2°C tolerance
        </Typography>
      </Box>
    </Paper>
  );
};

export default SteamTile;

