'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from '../store';
import { useAppSelector } from '../store';
import AuthProvider from './Providers/AuthProvider';
import { ToastContainer } from 'react-toastify';
import { Box, Skeleton } from '@mui/material';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0ea5e9',
    },
    secondary: {
      main: '#71717a',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38bdf8',
    },
    secondary: {
      main: '#a1a1aa',
    },
    background: {
      default: '#111827',
      paper: '#1f2937',
    },
  },
});

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { mode } = useAppSelector((state) => state.theme);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [mode, mounted]);

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  if (!mounted) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default'
        }}>
          <Box sx={{ p: 2 }}>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={400} />
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ToastContainer position="bottom-right" autoClose={3000} />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeWrapper>{children}</ThemeWrapper>
    </Provider>
  );
} 