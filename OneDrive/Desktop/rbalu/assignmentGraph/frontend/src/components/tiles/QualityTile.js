import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { kpiService } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { tilePaperStyle, tileTitleStyle, loadingPaperStyle } from '../../utils/tileStyles';

const QualityTile = () => {
  const { filters } = useFilters();
  const [data, setData] = useState(null);
  const [holdSamples, setHoldSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    kpiService.getQualityKPIs(filters)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching quality data:', err);
        setLoading(false);
      });
  }, [filters]);

  const handleClick = () => {
    setDialogOpen(true);
    kpiService.getHoldSamples({ limit: 10 })
      .then(res => setHoldSamples(res.data || []))
      .catch(err => console.error('Error fetching hold samples:', err));
  };

  if (loading) {
    return (
      <Paper elevation={0} sx={loadingPaperStyle}>
        <Typography variant="h6" gutterBottom>Quality (FPY)</Typography>
        <LinearProgress />
      </Paper>
    );
  }

  if (!data) return null;

  const fpy = data.fpy || 0;
  const color = fpy >= 95 ? 'success' : fpy >= 80 ? 'warning' : 'error';

  return (
    <>
      <Paper
        elevation={0}
        onClick={handleClick}
        sx={{
          ...tilePaperStyle,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          '&:hover': {
            ...tilePaperStyle['&:hover'],
            borderColor: 'rgba(0, 230, 118, 0.4)',
          },
        }}
      >
        <Typography variant="h6" sx={tileTitleStyle}>Quality (FPY)</Typography>
        
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
          <CircularProgress
            variant="determinate"
            value={fpy}
            size={140}
            thickness={5}
            sx={{
              color: `${color}.main`,
              filter: 'drop-shadow(0 0 8px rgba(0, 230, 118, 0.3))',
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
              {Math.round(fpy * 100) / 100}%
            </Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            PASS: {data.pass || 0} | HOLD: {data.hold || 0}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Click to view HOLD samples
          </Typography>
        </Box>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          HOLD Samples
          <IconButton onClick={() => setDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Batch ID</TableCell>
                  <TableCell>Product ID</TableCell>
                  <TableCell>Test Time</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holdSamples.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No HOLD samples found</TableCell>
                  </TableRow>
                ) : (
                  holdSamples.map((sample, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{sample.batch_id}</TableCell>
                      <TableCell>{sample.product_id}</TableCell>
                      <TableCell>{new Date(sample.test_time).toLocaleString()}</TableCell>
                      <TableCell>{sample.notes || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QualityTile;

