'use client';

import React from 'react';

const LoadingComponent: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-black"></div>
    </div>
  );
};

export default LoadingComponent;
