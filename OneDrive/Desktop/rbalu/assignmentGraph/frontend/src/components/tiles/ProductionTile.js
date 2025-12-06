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

const ProductionTile = () => {
  const { filters } = useFilters();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    kpiService.getProductionVsPlan(filters)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching production data:', err);
        setLoading(false);
      });
  }, [filters]);

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          height: '100%',
          background: 'rgba(22, 27, 34, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>Production vs Plan</Typography>
        <LinearProgress />
      </Paper>
    );
  }

  if (!data) return null;

  const productChartData = Object.entries(data.byProduct || {}).map(([name, value]) => ({
    name: name.length > 10 ? name.substring(0, 10) + '...' : name,
    value: Math.round(value * 100) / 100,
  })).filter(item => item.value > 0); // Filter out zero values

  const lineChartData = Object.entries(data.byLine || {}).map(([name, value]) => ({
    name: name.length > 10 ? name.substring(0, 10) + '...' : name,
    value: Math.round(value * 100) / 100,
  })).filter(item => item.value > 0); // Filter out zero values

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        background: 'rgba(22, 27, 34, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'rgba(0, 212, 255, 0.3)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0, 212, 255, 0.15)',
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2.5,
          fontWeight: 600,
          fontSize: '0.95rem',
          color: 'text.primary',
          letterSpacing: '-0.01em',
        }}
      >
        Production vs Plan
      </Typography>
      
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: '2rem',
            background: 'linear-gradient(135deg, #00d4ff 0%, #00e676 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5,
          }}
        >
          {Math.round(data.actual * 100) / 100} t
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Planned: {Math.round(data.planned * 100) / 100} t
        </Typography>
        <Box sx={{ mt: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(data.attainment || 0, 100)}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: data.attainment >= 95
                  ? 'linear-gradient(90deg, #66bb6a 0%, #00e676 100%)'
                  : data.attainment >= 80
                  ? 'linear-gradient(90deg, #ffb74d 0%, #ffa726 100%)'
                  : 'linear-gradient(90deg, #ff5252 0%, #f44336 100%)',
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Attainment
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: data.attainment >= 95 ? 'success.main' : data.attainment >= 80 ? 'warning.main' : 'error.main',
              }}
            >
              {Math.round(data.attainment * 100) / 100}%
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>
          By Product
        </Typography>
        {productChartData.length > 0 ? (
          <Box sx={{ height: 150, minHeight: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productChartData}>
                <defs>
                  <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#00a3cc" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255, 255, 255, 0.5)" 
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(22, 27, 34, 0.95)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: 4,
                    color: '#f0f6fc',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#productGradient)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box sx={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              No product data available
            </Typography>
          </Box>
        )}
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>
          By Line
        </Typography>
        {lineChartData.length > 0 ? (
          <Box sx={{ height: 150, minHeight: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lineChartData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e676" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#00b248" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255, 255, 255, 0.5)" 
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(22, 27, 34, 0.95)',
                    border: '1px solid rgba(0, 230, 118, 0.3)',
                    borderRadius: 4,
                    color: '#f0f6fc',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#lineGradient)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box sx={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              No line data available
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ProductionTile;

