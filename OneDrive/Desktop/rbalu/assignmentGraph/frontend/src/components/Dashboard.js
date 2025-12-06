import React from 'react';
import { Box, Grid } from '@mui/material';
import FilterBar from './FilterBar';
import LeftPanel from './LeftPanel';
import Plant3DView from './Plant3DView';
import RightPanel from './RightPanel';
import { useView } from '../context/ViewContext';
import ProductionTile from './tiles/ProductionTile';
import EnergyTile from './tiles/EnergyTile';
import SteamTile from './tiles/SteamTile';
import AvailabilityTile from './tiles/AvailabilityTile';
import QualityTile from './tiles/QualityTile';
import RecipeTile from './tiles/RecipeTile';
import SiloTile from './tiles/SiloTile';
import ReliabilityTile from './tiles/ReliabilityTile';
import PackagingTile from './tiles/PackagingTile';

const Dashboard = () => {
  const { activeView } = useView();

  // Awareness View - 3 Column Layout (Current Default)
  if (activeView === 'Awareness') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        {/* Filter Bar */}
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <FilterBar />
        </Box>

        {/* Main Content - 3 Column Layout */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Panel */}
          <Box sx={{ width: 300, flexShrink: 0, p: 2, overflowY: 'auto' }}>
            <LeftPanel />
          </Box>

          {/* Center Panel - 3D View */}
          <Box sx={{ flex: 1, p: 2 }}>
            <Plant3DView />
          </Box>

          {/* Right Panel */}
          <Box sx={{ width: 300, flexShrink: 0, p: 2, overflowY: 'auto' }}>
            <RightPanel />
          </Box>
        </Box>
      </Box>
    );
  }

  // Storehouse View - Focus on Inventory & Materials
  if (activeView === 'Storehouse') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <FilterBar />
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SiloTile />
            </Grid>
            <Grid item xs={12} md={6}>
              <LeftPanel />
            </Grid>
            <Grid item xs={12} md={6}>
              <ProductionTile />
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }

  // Comprehensive View - All KPIs in Grid
  if (activeView === 'Comprehensive') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <FilterBar />
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <ProductionTile />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <EnergyTile />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <SteamTile />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <AvailabilityTile />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <QualityTile />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <RecipeTile />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <SiloTile />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <ReliabilityTile />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <PackagingTile />
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }

  return null;
};

export default Dashboard;

