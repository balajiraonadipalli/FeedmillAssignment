import React, { useState, useEffect } from 'react';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Paper,
} from '@mui/material';
import { useFilters } from '../context/FilterContext';
import { dataService } from '../services/api';

const FilterBar = () => {
  const { filters, updateFilter } = useFilters();
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    // Fetch products and lines
    dataService.getProducts()
      .then(res => setProducts(res.data || []))
      .catch(err => console.error('Error fetching products:', err));

    dataService.getLines()
      .then(res => setLines(res.data || []))
      .catch(err => console.error('Error fetching lines:', err));
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap',
        background: 'rgba(22, 27, 34, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
      }}
    >
      <FormControl
        size="small"
        sx={{
          minWidth: 150,
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              borderColor: 'rgba(0, 212, 255, 0.3)',
            },
            '&.Mui-focused': {
              borderColor: 'rgba(0, 212, 255, 0.5)',
            },
          },
        }}
      >
        <InputLabel sx={{ color: 'text.secondary' }}>Time Range</InputLabel>
        <Select
          value={filters.timeRange}
          label="Time Range"
          onChange={(e) => updateFilter('timeRange', e.target.value)}
          sx={{ color: 'text.primary' }}
        >
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="yesterday">Yesterday</MenuItem>
          <MenuItem value="wtd">WTD</MenuItem>
          <MenuItem value="mtd">MTD</MenuItem>
        </Select>
      </FormControl>

      <FormControl
        size="small"
        sx={{
          minWidth: 200,
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              borderColor: 'rgba(0, 212, 255, 0.3)',
            },
            '&.Mui-focused': {
              borderColor: 'rgba(0, 212, 255, 0.5)',
            },
          },
        }}
      >
        <InputLabel sx={{ color: 'text.secondary' }}>Product</InputLabel>
        <Select
          value={filters.product || ''}
          label="Product"
          onChange={(e) => updateFilter('product', e.target.value || null)}
          sx={{ color: 'text.primary' }}
        >
          <MenuItem value="">All Products</MenuItem>
          {products.map((product) => (
            <MenuItem key={product.product_id} value={product.product_id}>
              {product.product_name || product.product_id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        size="small"
        sx={{
          minWidth: 150,
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              borderColor: 'rgba(0, 212, 255, 0.3)',
            },
            '&.Mui-focused': {
              borderColor: 'rgba(0, 212, 255, 0.5)',
            },
          },
        }}
      >
        <InputLabel sx={{ color: 'text.secondary' }}>Line</InputLabel>
        <Select
          value={filters.line || ''}
          label="Line"
          onChange={(e) => updateFilter('line', e.target.value || null)}
          sx={{ color: 'text.primary' }}
        >
          <MenuItem value="">All Lines</MenuItem>
          {lines.map((line) => (
            <MenuItem key={line} value={line}>
              {line}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {filters.product && (
          <Chip
            label={`Product: ${filters.product}`}
            onDelete={() => updateFilter('product', null)}
            size="small"
            sx={{
              background: 'rgba(0, 212, 255, 0.15)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#00d4ff',
              '& .MuiChip-deleteIcon': {
                color: '#00d4ff',
                '&:hover': {
                  color: '#5ddefc',
                },
              },
            }}
          />
        )}
        {filters.line && (
          <Chip
            label={`Line: ${filters.line}`}
            onDelete={() => updateFilter('line', null)}
            size="small"
            sx={{
              background: 'rgba(0, 230, 118, 0.15)',
              border: '1px solid rgba(0, 230, 118, 0.3)',
              color: '#00e676',
              '& .MuiChip-deleteIcon': {
                color: '#00e676',
                '&:hover': {
                  color: '#5efc82',
                },
              },
            }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default FilterBar;

