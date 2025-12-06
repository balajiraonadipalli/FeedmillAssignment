import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import {
  Paper,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BoltIcon from '@mui/icons-material/Bolt';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import FactoryIcon from '@mui/icons-material/Factory';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { format } from 'date-fns';
import { kpiService } from '../services/api';
import { useFilters } from '../context/FilterContext';

// Equipment component with KPI display
const Equipment = ({ position, name, kpi, color = '#4fc3f7', onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={hovered ? '#81c784' : color} />
      </mesh>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      {kpi && (
        <Html position={[0, -1.5, 0]} center>
          <Box
            sx={{
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '4px 8px',
              borderRadius: '4px',
              color: 'white',
              fontSize: '10px',
              whiteSpace: 'nowrap',
            }}
          >
            {kpi}
          </Box>
        </Html>
      )}
    </group>
  );
};

// Silo component (taller)
const Silo = ({ position, name, level, capacity, material, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const utilization = capacity > 0 ? (level / capacity) * 100 : 0;
  const color = utilization >= 90 ? '#f44336' : utilization >= 70 ? '#ff9800' : '#4caf50';

  return (
    <group position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh>
        <boxGeometry args={[1.5, 4, 1.5]} />
        <meshStandardMaterial color={hovered ? '#81c784' : color} />
      </mesh>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      <Html position={[0, -2.5, 0]} center>
        <Box
          sx={{
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '4px 8px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '10px',
            whiteSpace: 'nowrap',
          }}
        >
          {material}: {level.toFixed(1)}t
        </Box>
      </Html>
    </group>
  );
};

const Plant3DView = () => {
  const { filters, updateFilter } = useFilters();
  const [kpiData, setKpiData] = useState({});
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState('2X');
  const [fps, setFps] = useState(60);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isOn, setIsOn] = useState(true);
  const controlsRef = useRef();

  // Map time range from 3D view to filter context
  const timeRangeMap = {
    'Day': 'today',
    'Week': 'wtd',
    'Month': 'mtd',
    'Year': 'mtd', // Year uses MTD for now
  };

  const currentTimeRange = Object.keys(timeRangeMap).find(
    key => timeRangeMap[key] === filters.timeRange
  ) || 'Day';

  const handleTimeRangeChange = (range) => {
    const filterValue = timeRangeMap[range] || 'wtd';
    updateFilter('timeRange', filterValue);
  };

  // Fetch KPI data - only when plant is ON
  useEffect(() => {
    if (!isOn) return; // Don't fetch data when plant is OFF

    const fetchData = () => {
      Promise.all([
        kpiService.getSiloKPIs(filters),
        kpiService.getEnergyKPIs(filters),
        kpiService.getSteamKPIs(filters),
        kpiService.getProductionKPIs(filters),
        kpiService.getAvailability(filters),
      ])
        .then(([silos, energy, steam, production, availability]) => {
          setKpiData({
            silos: silos.data || [],
            energy: energy.data || {},
            steam: steam.data || {},
            production: production.data || {},
            availability: availability.data || {},
          });
          setLastUpdate(new Date());
        })
        .catch(err => console.error('Error fetching KPI data for 3D view:', err));
    };

    // Initial fetch
    fetchData();

    // Auto-refresh every 30 seconds when plant is ON
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [filters, isOn]);

  // Update FPS and timestamp when playing
  useEffect(() => {
    if (isPlaying && isOn) {
      const interval = setInterval(() => {
        setFps(Math.floor(Math.random() * 10) + 55);
        setLastUpdate(new Date());
      }, 1000);
      return () => clearInterval(interval);
    } else if (!isOn) {
      setFps(0); // Set FPS to 0 when plant is OFF
    }
  }, [isPlaying, isOn]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setFps(Math.floor(Math.random() * 10) + 55);
        setLastUpdate(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handleEquipmentClick = (equipment, data) => {
    setSelectedEquipment({ equipment, data });
    setDialogOpen(true);
  };

  const silos = kpiData.silos || [];

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 0,
          height: 'calc(100vh - 64px)',
          position: 'relative',
          background: 'rgba(22, 27, 34, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Status Bar */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 10,
            px: 1.5,
            py: 0.5,
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: 1,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.7rem', 
              color: isOn ? 'success.main' : 'error.main',
              fontWeight: 600,
            }}
          >
            {isOn ? 'Connected' : 'OFFLINE'}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            |
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            FPS {fps}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            |
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            Last Update {format(lastUpdate, 'HH:mm:ss')}
          </Typography>
        </Box>

        {/* Control Buttons */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            display: 'flex',
            gap: 1,
          }}
        >
          <Button
            variant={isOn ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setIsOn(!isOn)}
            sx={{
              minWidth: 80,
              fontSize: '0.75rem',
              background: isOn ? 'rgba(0, 230, 118, 0.2)' : 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: isOn ? 'text.primary' : 'text.secondary',
              '&:hover': {
                background: isOn ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Turn ON
          </Button>
          <Button
            variant={!isOn ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setIsOn(!isOn)}
            sx={{
              minWidth: 80,
              fontSize: '0.75rem',
              background: !isOn ? 'rgba(255, 82, 82, 0.2)' : 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: !isOn ? 'text.primary' : 'text.secondary',
              '&:hover': {
                background: !isOn ? 'rgba(255, 82, 82, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Turn OFF
          </Button>
        </Box>

        {/* Plant Status Overlay - shown when OFF */}
        {!isOn && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 120,
              zIndex: 5,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'rgba(255, 82, 82, 0.2)',
                border: '2px solid rgba(255, 82, 82, 0.5)',
                textAlign: 'center',
              }}
            >
              <Typography variant="h5" sx={{ color: 'error.main', fontWeight: 700, mb: 1 }}>
                PLANT OFFLINE
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Click "Turn ON" to resume operations
              </Typography>
            </Box>
          </Box>
        )}

        <Box
          sx={{
            position: 'relative',
            height: 'calc(100% - 120px)',
            pointerEvents: dialogOpen ? 'none' : 'auto',
            opacity: dialogOpen ? 0.3 : isOn ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
            filter: isOn ? 'none' : 'grayscale(50%)',
          }}
        >
          <Canvas 
            camera={{ position: [15, 10, 15], fov: 50 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <directionalLight position={[0, 10, 0]} intensity={0.5} />

          {/* Raw Material Silos */}
          {silos.slice(0, 3).map((silo, idx) => (
            <Silo
              key={idx}
              position={[-8 + idx * 3, 2, -5]}
              name={`Silo ${idx + 1}`}
              level={silo.level_t || 0}
              capacity={silo.capacity_t || 100}
              material={silo.material || 'Material'}
              onClick={() => handleEquipmentClick(`Silo ${idx + 1}`, {
                material: silo.material,
                level: silo.level_t,
                capacity: silo.capacity_t,
                doc: silo.doc,
              })}
            />
          ))}

          {/* Grinder / Mixer */}
          <Equipment
            position={[0, 1, -2]}
            name="Grinder/Mixer"
            kpi={`Batches: ${Math.round((kpiData.production?.actual || 0) / 5)}`}
            color="#ff9800"
            onClick={() => handleEquipmentClick('Grinder/Mixer', {
              batches: Math.round((kpiData.production?.actual || 0) / 5),
            })}
          />

          {/* Conditioner */}
          <Equipment
            position={[0, 1, 0]}
            name="Conditioner"
            kpi={`Stability: ${Math.round((kpiData.steam?.conditionerStability || 0) * 100) / 100}%`}
            color="#9c27b0"
            onClick={() => handleEquipmentClick('Conditioner', {
              stability: kpiData.steam?.conditionerStability,
              steamPerTon: kpiData.steam?.steamPerTon,
            })}
          />

          {/* Pellet Mill */}
          <Equipment
            position={[0, 1, 2]}
            name="Pellet Mill"
            kpi={`${Math.round((kpiData.production?.actual || 0) * 100) / 100} t`}
            color="#2196f3"
            onClick={() => handleEquipmentClick('Pellet Mill', {
              production: kpiData.production?.actual,
              steamPerTon: kpiData.steam?.steamPerTon,
            })}
          />

          {/* Cooler (optional) */}
          <Equipment
            position={[0, 1, 4]}
            name="Cooler"
            kpi="Active"
            color="#00bcd4"
            onClick={() => handleEquipmentClick('Cooler', { status: 'Active' })}
          />

          {/* Bagging Line */}
          <Equipment
            position={[3, 1, 2]}
            name="Bagging"
            kpi="25kg bags"
            color="#4caf50"
            onClick={() => handleEquipmentClick('Bagging Line', { type: '25kg bags' })}
          />

          {/* Bulk Loading / Dispatch */}
          <Equipment
            position={[6, 1, 2]}
            name="Dispatch"
            kpi="Loading"
            color="#607d8b"
            onClick={() => handleEquipmentClick('Dispatch', { status: 'Loading' })}
          />

          {/* Utilities block (Energy) */}
          <Equipment
            position={[-3, 1, 2]}
            name="Utilities"
            kpi={`SEC: ${Math.round((kpiData.energy?.sec || 0) * 100) / 100} kWh/t`}
            color="#ff5722"
            onClick={() => handleEquipmentClick('Utilities', {
              sec: kpiData.energy?.sec,
              totalKWh: kpiData.energy?.totalKWh,
              powerFactor: kpiData.energy?.powerFactor,
            })}
          />

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>

          <OrbitControls 
            ref={controlsRef}
            enablePan={!dialogOpen && isOn} 
            enableZoom={!dialogOpen && isOn} 
            enableRotate={!dialogOpen && isOn} 
          />
        </Canvas>
        </Box>

        {/* Time Navigation and Controls */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            zIndex: 10,
          }}
        >
          {/* Time Range Selection */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {['Year', 'Month', 'Week', 'Day'].map((range) => (
              <Button
                key={range}
                size="small"
                onClick={() => handleTimeRangeChange(range)}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  minWidth: 60,
                  color: currentTimeRange === range ? 'text.primary' : 'text.secondary',
                  background: currentTimeRange === range ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: currentTimeRange === range ? 'rgba(0, 212, 255, 0.3)' : 'rgba(0, 212, 255, 0.15)',
                    borderColor: 'rgba(0, 212, 255, 0.3)',
                  },
                }}
              >
                {range}
              </Button>
            ))}
          </Box>

          {/* Playback Controls */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <SkipPreviousIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setIsPlaying(!isPlaying)}
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <SkipNextIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.7rem' }}>
              {currentTimeRange}
            </Typography>
          </Box>

          {/* Zoom Controls */}
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {['10x', '8x', '6x', '4x', '2X'].map((zoom) => (
              <Button
                key={zoom}
                size="small"
                onClick={() => setZoomLevel(zoom)}
                sx={{
                  px: 1,
                  py: 0.25,
                  fontSize: '0.7rem',
                  minWidth: 40,
                  color: zoomLevel === zoom ? 'text.primary' : 'text.secondary',
                  background: zoomLevel === zoom ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(0, 212, 255, 0.15)',
                  },
                }}
              >
                {zoom}
              </Button>
            ))}
          </Box>

          {/* Timestamp */}
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            {format(lastUpdate, 'yyyy-MM-dd HH:mm:ss')}
          </Typography>
        </Box>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 1300,
          },
        }}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)',
            borderRadius: 2,
            position: 'relative',
            zIndex: 1301,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          },
        }}
        sx={{
          zIndex: 1300,
          '& .MuiDialog-container': {
            zIndex: 1300,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FactoryIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" component="span">
              {selectedEquipment?.equipment}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setDialogOpen(false)}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedEquipment?.data && (
            <Grid container spacing={2}>
              {Object.entries(selectedEquipment.data).map(([key, value]) => {
                const formattedKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .trim();
                const formattedValue = typeof value === 'number'
                  ? (value % 1 === 0 ? value : Math.round(value * 100) / 100)
                  : value;
                
                // Determine icon and color based on key
                let icon = <SpeedIcon />;
                let color = 'primary';
                if (key.toLowerCase().includes('energy') || key.toLowerCase().includes('sec') || key.toLowerCase().includes('kwh')) {
                  icon = <BoltIcon />;
                  color = 'warning';
                } else if (key.toLowerCase().includes('steam') || key.toLowerCase().includes('water')) {
                  icon = <WaterDropIcon />;
                  color = 'info';
                } else if (key.toLowerCase().includes('level') || key.toLowerCase().includes('capacity') || key.toLowerCase().includes('material')) {
                  icon = <StorageIcon />;
                  color = 'success';
                }

                // Determine if value is good/bad based on context
                let valueColor = 'text.primary';
                let chipColor = 'default';
                if (typeof value === 'number') {
                  if (key.toLowerCase().includes('stability') || key.toLowerCase().includes('adherence') || key.toLowerCase().includes('fpy')) {
                    chipColor = value >= 95 ? 'success' : value >= 80 ? 'warning' : 'error';
                  } else if (key.toLowerCase().includes('sec') || key.toLowerCase().includes('rework') || key.toLowerCase().includes('downtime')) {
                    chipColor = value <= 5 ? 'success' : value <= 10 ? 'warning' : 'error';
                  }
                }

                return (
                  <Grid item xs={12} sm={6} key={key}>
                    <Card
                      sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box sx={{ color: `${color}.main` }}>{icon}</Box>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ flexGrow: 1 }}>
                            {formattedKey}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: valueColor,
                              fontWeight: 'bold',
                            }}
                          >
                            {formattedValue}
                            {typeof value === 'number' && (
                              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                {key.toLowerCase().includes('percentage') || key.toLowerCase().includes('stability') || key.toLowerCase().includes('adherence') || key.toLowerCase().includes('fpy')
                                  ? '%'
                                  : key.toLowerCase().includes('ton') || key.toLowerCase().includes('mass')
                                  ? ' t'
                                  : key.toLowerCase().includes('kwh')
                                  ? ' kWh'
                                  : key.toLowerCase().includes('kg')
                                  ? ' kg'
                                  : key.toLowerCase().includes('minute') || key.toLowerCase().includes('tat')
                                  ? ' min'
                                  : key.toLowerCase().includes('rate') || key.toLowerCase().includes('tph')
                                  ? ' t/h'
                                  : key.toLowerCase().includes('doc')
                                  ? ' days'
                                  : ''}
                              </Typography>
                            )}
                          </Typography>
                          {typeof value === 'number' && (key.toLowerCase().includes('stability') || key.toLowerCase().includes('adherence') || key.toLowerCase().includes('fpy') || key.toLowerCase().includes('sec') || key.toLowerCase().includes('rework')) && (
                            <Chip
                              label={chipColor === 'success' ? 'Good' : chipColor === 'warning' ? 'Fair' : 'Poor'}
                              size="small"
                              color={chipColor}
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="contained"
            color="primary"
            sx={{ minWidth: 100 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Plant3DView;

