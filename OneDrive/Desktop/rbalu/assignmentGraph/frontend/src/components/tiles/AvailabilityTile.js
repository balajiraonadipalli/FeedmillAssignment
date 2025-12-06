import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { kpiService } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { tilePaperStyle, tileTitleStyle, loadingPaperStyle } from '../../utils/tileStyles';

const AvailabilityTile = () => {
  const { filters } = useFilters();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    kpiService.getAvailability(filters)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching availability data:', err);
        setLoading(false);
      });
  }, [filters]);

  if (loading) {
    return (
      <Paper elevation={0} sx={loadingPaperStyle}>
        <Typography variant="h6" gutterBottom>Availability</Typography>
        <LinearProgress />
      </Paper>
    );
  }

  if (!data) return null;

  const availability = data.availability || 0;
  const color = availability >= 95 ? 'success' : availability >= 80 ? 'warning' : 'error';

  return (
    <Paper
      elevation={0}
      sx={{
        ...tilePaperStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h6" sx={tileTitleStyle}>Availability</Typography>
      
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
        <CircularProgress
          variant="determinate"
          value={availability}
          size={140}
          thickness={5}
          sx={{
            color: `${color}.main`,
            filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.3))',
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #00d4ff 0%, #00e676 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {Math.round(availability * 100) / 100}%
          </Typography>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'center', width: '100%' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Run: {Math.round(data.runMinutes || 0)} min
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {Math.round(data.totalMinutes || 0)} min
        </Typography>
      </Box>
    </Paper>
  );
};

export default AvailabilityTile;

