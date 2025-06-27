import React from 'react';
import './Loader.css';

function Loader({ size = 'medium', center = false }) {
  const loaderClasses = `loader loader-${size} ${center ? 'loader-center' : ''}`;
  
  return (
    <div className={loaderClasses}>
      <div className="loader-spinner"></div>
    </div>
  );
}

export default Loader; 