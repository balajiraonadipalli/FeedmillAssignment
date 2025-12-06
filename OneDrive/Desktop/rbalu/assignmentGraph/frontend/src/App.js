import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import { FilterProvider } from './context/FilterContext';
import { ViewProvider } from './context/ViewContext';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      light: '#5ddefc',
      dark: '#00a3cc',
    },
    secondary: {
      main: '#00e676',
      light: '#5efc82',
      dark: '#00b248',
    },
    error: {
      main: '#ff5252',
      light: '#ff867f',
      dark: '#c50e29',
    },
    warning: {
      main: '#ffb74d',
      light: '#ffe97d',
      dark: '#c88719',
    },
    success: {
      main: '#66bb6a',
      light: '#98ee99',
      dark: '#338a3e',
    },
    info: {
      main: '#42a5f5',
      light: '#80d6ff',
      dark: '#0077c2',
    },
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
    text: {
      primary: '#f0f6fc',
      secondary: '#8b949e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.75rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(0, 212, 255, 0.3)',
            boxShadow: '0 4px 16px rgba(0, 212, 255, 0.1)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FilterProvider>
        <ViewProvider>
          <Box
            sx={{
              minHeight: '100vh',
              background: 'linear-gradient(180deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
              backgroundAttachment: 'fixed',
            }}
          >
            <Header />
            <Dashboard />
          </Box>
        </ViewProvider>
      </FilterProvider>
    </ThemeProvider>
  );
}

export default App;

