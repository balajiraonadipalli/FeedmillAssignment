import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
} from '@mui/material';
import FactoryIcon from '@mui/icons-material/Factory';
import StorageIcon from '@mui/icons-material/Storage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ListIcon from '@mui/icons-material/List';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import BoltIcon from '@mui/icons-material/Bolt';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { kpiService } from '../services/api';
import { useFilters } from '../context/FilterContext';

const LeftPanel = () => {
  const { filters } = useFilters();
  const [siloData, setSiloData] = useState([]);
  const [inventoryHealth, setInventoryHealth] = useState({ sufficiency: 92, turnover: 78 });
  const [statusSummary, setStatusSummary] = useState({
    operating: true,
    alerts: 2,
    maintenance: false,
    energy: true,
  });

  useEffect(() => {
    kpiService.getSiloKPIs(filters)
      .then(res => {
        setSiloData(res.data || []);
      })
      .catch(err => console.error('Error fetching silo data:', err));
  }, [filters]);

  const materials = [
    { name: 'Corn', percentage: 85 },
    { name: 'Soybean Meal', percentage: 72 },
    { name: 'Wheat', percentage: 91 },
    { name: 'Premix', percentage: 68 },
  ];

  const cardStyle = {
    p: 2.5,
    mb: 2,
    background: 'rgba(22, 27, 34, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', overflowY: 'auto', pr: 2 }}>
      {/* Plant Introduction */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FactoryIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Plant Introduction
          </Typography>
        </Box>
        <Box
          sx={{
            height: 150,
            mb: 2,
            borderRadius: 1,
            overflow: 'hidden',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <mesh>
              <boxGeometry args={[2, 3, 1]} />
              <meshStandardMaterial color="#4a5568" />
            </mesh>
            <mesh position={[0, 2, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
              <meshStandardMaterial color="#718096" />
            </mesh>
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
          </Canvas>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.6 }}>
          This feed mill processes raw materials through silos, mixers, conditioners, and a pellet mill to produce finished feed. The digital-twin system visualizes real-time operations, material levels, machine status, and energy usage, giving operators a clear understanding of plant performance.
        </Typography>
      </Paper>

      {/* Silo Material Overview */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <StorageIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Silo Material Overview
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {materials.map((material, idx) => (
            <Box key={idx}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  {material.name}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'primary.main' }}>
                  {material.percentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={material.percentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #66bb6a 0%, #00e676 100%)',
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Inventory Health */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AssessmentIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Inventory Health
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                Raw Material Sufficiency Rate
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'primary.main' }}>
                {inventoryHealth.sufficiency}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={inventoryHealth.sufficiency}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #66bb6a 0%, #00e676 100%)',
                },
              }}
            />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                Turnover Efficiency
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'primary.main' }}>
                {inventoryHealth.turnover}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={inventoryHealth.turnover}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #ffb74d 0%, #ffa726 100%)',
                },
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Status Summary */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ListIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Status Summary
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              Operating Normally
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: 'error.main', fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              Alerts - {statusSummary.alerts}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              Maintenance
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BoltIcon sx={{ color: 'success.main', fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              Energy Normal
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LeftPanel;

