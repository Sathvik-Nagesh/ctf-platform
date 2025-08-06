import React from 'react';

const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 