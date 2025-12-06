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
  Cell,
} from 'recharts';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SettingsIcon from '@mui/icons-material/Settings';
import BoltIcon from '@mui/icons-material/Bolt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BarChartIcon from '@mui/icons-material/BarChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { kpiService } from '../services/api';
import { useFilters } from '../context/FilterContext';

const RightPanel = () => {
  const { filters } = useFilters();
  const [productionData, setProductionData] = useState(null);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [energyData, setEnergyData] = useState(null);
  const [alarms, setAlarms] = useState(2);
  const [machineStatus, setMachineStatus] = useState([
    { name: 'Ginder', value: 78, color: '#66bb6a' },
    { name: 'Mixer', value: 65, color: '#ffb74d' },
    { name: 'Conditioner', value: 5, color: '#90a4ae' },
    { name: 'Pellet', value: 82, color: '#ba68c8' },
  ]);
  const [costPerformance, setCostPerformance] = useState({
    energyCost: 45.2,
    maintenanceCost: 12.8,
    efficiency: 87.3,
  });

  useEffect(() => {
    Promise.all([
      kpiService.getProductionVsPlan(filters),
      kpiService.getAvailability(filters),
      kpiService.getEnergyKPIs(filters),
    ])
      .then(([production, availability, energy]) => {
        setProductionData(production.data);
        setAvailabilityData(availability.data);
        setEnergyData(energy.data);
      })
      .catch(err => console.error('Error fetching KPI data:', err));
  }, [filters]);

  const cardStyle = {
    p: 2.5,
    mb: 2,
    background: 'rgba(22, 27, 34, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
  };

  const productionRate = productionData ? (productionData.actual / 24).toFixed(1) : '12.5';
  const targetRate = productionData ? (productionData.planned / 24).toFixed(1) : '15.0';
  const availability = availabilityData ? (availabilityData.availability || 0).toFixed(1) : '94.2';
  const energyUsage = energyData ? (energyData.totalKWh || 0).toFixed(1) : '156.8';

  // Energy usage chart data
  const energyChartData = energyData?.demandTrend?.slice(-10).map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    kWh: Math.round(item.kW * 100) / 100,
  })) || [];

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', overflowY: 'auto', pl: 2 }}>
      {/* Production Rate */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ShowChartIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Production Rate
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: '1.75rem',
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          {productionRate} t/h
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
          Target: {targetRate} t/h
        </Typography>
      </Paper>

      {/* Plant Availability */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SettingsIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Plant Availability
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: '1.75rem',
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          {availability}%
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
          Operating Time
        </Typography>
      </Paper>

      {/* Plant Energy Usage */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BoltIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Plant Energy Usage
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: '1.75rem',
            color: 'text.primary',
            mb: 2,
          }}
        >
          {energyUsage} kWh
        </Typography>
        {energyChartData.length > 0 && (
          <Box sx={{ height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyChartData}>
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
                <Bar dataKey="kWh" fill="#00e676" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>

      {/* Active Alarms */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <NotificationsIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Active Alarms
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: '1.75rem',
            color: 'error.main',
            mb: 0.5,
          }}
        >
          {alarms}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
          Pending Alerts
        </Typography>
      </Paper>

      {/* Machine Run Status */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BarChartIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Machine Run Status
          </Typography>
        </Box>
        <Box sx={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={machineStatus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis type="number" domain={[0, 100]} stroke="rgba(255, 255, 255, 0.5)" fontSize={10} />
              <YAxis dataKey="name" type="category" stroke="rgba(255, 255, 255, 0.5)" fontSize={10} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(22, 27, 34, 0.95)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: 4,
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {machineStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Cost & Performance */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AttachMoneyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Cost & Performance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              Energy Cost per Ton
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'primary.main' }}>
              ${costPerformance.energyCost}/t
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              Maintenance Cost
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'primary.main' }}>
              ${costPerformance.maintenanceCost}/t
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              Overall Efficiency
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'primary.main' }}>
              {costPerformance.efficiency}%
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RightPanel;

