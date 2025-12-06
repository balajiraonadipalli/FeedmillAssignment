import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Divider,
} from '@mui/material';
import { kpiService } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { tilePaperStyle, tileTitleStyle, tileValueStyle, loadingPaperStyle } from '../../utils/tileStyles';

const PackagingTile = () => {
  const { filters } = useFilters();
  const [packagingData, setPackagingData] = useState(null);
  const [dispatchData, setDispatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      kpiService.getPackagingKPIs(filters),
      kpiService.getDispatchKPIs(filters),
    ])
      .then(([packRes, dispRes]) => {
        setPackagingData(packRes.data);
        setDispatchData(dispRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching packaging data:', err);
        setLoading(false);
      });
  }, [filters]);

  if (loading) {
    return (
      <Paper elevation={0} sx={loadingPaperStyle}>
        <Typography variant="h6" gutterBottom>Packaging & Dispatch</Typography>
        <LinearProgress />
      </Paper>
    );
  }

  const reworkPct = packagingData?.reworkPercentage || 0;
  const reworkColor = reworkPct > 5 ? 'error' : reworkPct > 2 ? 'warning' : 'success';

  return (
    <Paper elevation={0} sx={tilePaperStyle}>
      <Typography variant="h6" sx={tileTitleStyle}>Packaging & Dispatch</Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 1, color: 'text.secondary' }}>
          Packaging
        </Typography>
        <Typography variant="h5" sx={{ ...tileValueStyle, fontSize: '1.75rem', mb: 1 }}>
          {packagingData?.bagCount || 0} bags
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Rework: {Math.round(reworkPct * 100) / 100}%
          </Typography>
          <Typography variant="caption" sx={{ color: `${reworkColor}.main`, fontWeight: 600 }}>
            {reworkPct > 5 ? 'High' : reworkPct > 2 ? 'Moderate' : 'Low'}
          </Typography>
        </Box>
        {packagingData?.reworkPercentage !== undefined && (
          <LinearProgress
            variant="determinate"
            value={Math.min(reworkPct, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: reworkPct > 5
                  ? 'linear-gradient(90deg, #ff5252 0%, #f44336 100%)'
                  : reworkPct > 2
                  ? 'linear-gradient(90deg, #ffb74d 0%, #ffa726 100%)'
                  : 'linear-gradient(90deg, #66bb6a 0%, #00e676 100%)',
              },
            }}
          />
        )}
      </Box>

      <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 1, color: 'text.secondary' }}>
          Dispatch
        </Typography>
        <Typography variant="h5" sx={{ ...tileValueStyle, fontSize: '1.75rem', mb: 1 }}>
          {Math.round((dispatchData?.truckTAT || 0) * 100) / 100} min
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Median Truck Turnaround Time
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Loading Rate: {Math.round((dispatchData?.loadingRate || 0) * 100) / 100} t/h
        </Typography>
      </Box>
    </Paper>
  );
};

export default PackagingTile;

