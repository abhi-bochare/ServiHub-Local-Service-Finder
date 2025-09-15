import React from 'react';
import { ClipLoader } from 'react-spinners';

const LoadingSpinner = ({ size = 35, color = "#3B82F6", loading = true }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <ClipLoader color={color} loading={loading} size={size} />
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;