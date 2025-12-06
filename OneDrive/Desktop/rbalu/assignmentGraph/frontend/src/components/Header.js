import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';
import FactoryIcon from '@mui/icons-material/Factory';
import SettingsIcon from '@mui/icons-material/Settings';
import { format } from 'date-fns';
import { useView } from '../context/ViewContext';

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { activeView, setActiveView } = useView();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ px: 3, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FactoryIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              color: 'text.primary',
            }}
          >
            Feed-Mill Digital Twin
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
          {['Awareness', 'Storehouse', 'Comprehensive'].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveView(tab)}
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: activeView === tab ? 'text.primary' : 'text.secondary',
                background: activeView === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              {tab}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            {format(currentTime, 'yyyy-MM-dd HH:mm:ss')}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            24°C
          </Typography>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

