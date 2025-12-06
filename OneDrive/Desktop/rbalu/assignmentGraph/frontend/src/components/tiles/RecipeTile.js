import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import { kpiService } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { tilePaperStyle, tileTitleStyle, tileValueStyle, loadingPaperStyle } from '../../utils/tileStyles';

const RecipeTile = () => {
  const { filters } = useFilters();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    kpiService.getRecipeAdherence(filters)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching recipe data:', err);
        setLoading(false);
      });
  }, [filters]);

  if (loading) {
    return (
      <Paper elevation={0} sx={loadingPaperStyle}>
        <Typography variant="h6" gutterBottom>Recipe Adherence</Typography>
        <LinearProgress />
      </Paper>
    );
  }

  if (!data) return null;

  const adherence = data.adherence || 0;
  const adherenceColor = adherence >= 95 ? 'success' : adherence >= 80 ? 'warning' : 'error';
  const worstIngredient = data.worstIngredient;

  return (
    <Paper elevation={0} sx={tilePaperStyle}>
      <Typography variant="h6" sx={tileTitleStyle}>Recipe Adherence</Typography>
      
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={tileValueStyle}>
          {Math.round(adherence * 100) / 100}%
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Within Tolerance (±2% macro, ±5% micro)
        </Typography>
        <Box sx={{ mt: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={adherence}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: adherence >= 95
                  ? 'linear-gradient(90deg, #66bb6a 0%, #00e676 100%)'
                  : adherence >= 80
                  ? 'linear-gradient(90deg, #ffb74d 0%, #ffa726 100%)'
                  : 'linear-gradient(90deg, #ff5252 0%, #f44336 100%)',
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {data.within || 0} / {data.total || 0} weighments
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: `${adherenceColor}.main` }}>
              {adherence >= 95 ? 'Excellent' : adherence >= 80 ? 'Good' : 'Needs Attention'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Worst Ingredient Highlight */}
      {worstIngredient && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 1,
            background: 'rgba(255, 82, 82, 0.1)',
            border: '1px solid rgba(255, 82, 82, 0.3)',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
            Worst Performing Ingredient:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
            {worstIngredient.name} - {Math.round(worstIngredient.adherence * 100) / 100}% adherence
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default RecipeTile;

