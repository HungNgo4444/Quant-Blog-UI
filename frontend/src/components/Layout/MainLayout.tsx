'use client';

import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import NotificationManager from '../Common/NotificationManager';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className = '' }) => {
  return (
    <Box className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main content area with padding for fixed header */}
      <Box
        component="main"
        className={`flex-1 pt-16 ${className}`}
      >
        {children}
      </Box>
      
      {/* Footer */}
      <Footer />
      
      {/* Global notification manager */}
      <NotificationManager />
    </Box>
  );
};

export default MainLayout; 