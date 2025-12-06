import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { kpiService } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { tilePaperStyle, tileTitleStyle, loadingPaperStyle } from '../../utils/tileStyles';
import { format } from 'date-fns';

const SiloTile = () => {
  const { filters } = useFilters();
  const [data, setData] = useState(null);
  const [eventCounts, setEventCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      kpiService.getSiloKPIs(filters),
      kpiService.getSiloEvents({ limit: 100 }),
    ])
      .then(([siloRes, eventsRes]) => {
        setData(siloRes.data);
        
        // Count events by type
        const eventsData = eventsRes.data || [];
        const counts = {
          LOW_LEVEL: eventsData.filter(e => e.event_type === 'LOW_LEVEL').length,
          CHANGEOVER: eventsData.filter(e => e.event_type === 'CHANGEOVER').length,
        };
        setEventCounts(counts);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching silo data:', err);
        setLoading(false);
      });
  }, [filters]);

  const handleEventClick = (eventType) => {
    setSelectedEventType(eventType);
    setDialogOpen(true);
    kpiService.getSiloEvents({ limit: 10, eventType })
      .then(res => setEvents(res.data || []))
      .catch(err => console.error('Error fetching events:', err));
  };

  if (loading) {
    return (
      <Paper elevation={0} sx={loadingPaperStyle}>
        <Typography variant="h6" gutterBottom>Material Coverage (Silos)</Typography>
        <LinearProgress />
      </Paper>
    );
  }

  if (!data || !Array.isArray(data)) return null;

  return (
    <>
      <Paper elevation={0} sx={tilePaperStyle}>
        <Typography variant="h6" sx={tileTitleStyle}>Material Coverage (Silos)</Typography>
        
        {/* Event Counts */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<WarningIcon />}
            label={`LOW_LEVEL: ${eventCounts.LOW_LEVEL || 0}`}
            onClick={() => handleEventClick('LOW_LEVEL')}
            size="small"
            sx={{
              cursor: 'pointer',
              background: 'rgba(255, 82, 82, 0.2)',
              border: '1px solid rgba(255, 82, 82, 0.3)',
              color: 'error.main',
              '&:hover': {
                background: 'rgba(255, 82, 82, 0.3)',
              },
            }}
          />
          <Chip
            icon={<SwapHorizIcon />}
            label={`CHANGEOVER: ${eventCounts.CHANGEOVER || 0}`}
            onClick={() => handleEventClick('CHANGEOVER')}
            size="small"
            sx={{
              cursor: 'pointer',
              background: 'rgba(255, 183, 77, 0.2)',
              border: '1px solid rgba(255, 183, 77, 0.3)',
              color: 'warning.main',
              '&:hover': {
                background: 'rgba(255, 183, 77, 0.3)',
              },
            }}
          />
        </Box>
        
        <Grid container spacing={2.5} sx={{ mt: 1 }}>
          {data.map((silo, idx) => {
            const doc = silo.doc || 0;
            const utilization = silo.utilization || 0;
            const docColor = doc < 3 ? 'error' : doc < 7 ? 'warning' : 'success';
            const utilColor = utilization >= 90 ? 'error' : utilization >= 70 ? 'warning' : 'success';
            
            return (
              <Grid item xs={12} sm={6} key={idx}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(0, 212, 255, 0.2)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {silo.material || silo._id}
                    </Typography>
                    <Chip
                      label={`DOC: ${Math.round(doc * 100) / 100}d`}
                      size="small"
                      sx={{
                        background: `rgba(${docColor === 'error' ? '255, 82, 82' : docColor === 'warning' ? '255, 183, 77' : '102, 187, 106'}, 0.2)`,
                        border: `1px solid rgba(${docColor === 'error' ? '255, 82, 82' : docColor === 'warning' ? '255, 183, 77' : '102, 187, 106'}, 0.3)`,
                        color: `${docColor}.main`,
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={utilization}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      mb: 1,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: utilization >= 90
                          ? 'linear-gradient(90deg, #ff5252 0%, #f44336 100%)'
                          : utilization >= 70
                          ? 'linear-gradient(90deg, #ffb74d 0%, #ffa726 100%)'
                          : 'linear-gradient(90deg, #66bb6a 0%, #00e676 100%)',
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {Math.round(silo.level_t * 100) / 100} t / {Math.round(silo.capacity_t * 100) / 100} t
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Events Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(22, 27, 34, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Last 10 {selectedEventType} Events
          </Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Silo ID</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>Level (t)</TableCell>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Batch ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{event.timestamp ? format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss') : '-'}</TableCell>
                    <TableCell>{event.silo_id || '-'}</TableCell>
                    <TableCell>{event.material || '-'}</TableCell>
                    <TableCell>{event.level_t ? Math.round(event.level_t * 100) / 100 : '-'}</TableCell>
                    <TableCell>{event.order_id || '-'}</TableCell>
                    <TableCell>{event.batch_id || '-'}</TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No events found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SiloTile;

