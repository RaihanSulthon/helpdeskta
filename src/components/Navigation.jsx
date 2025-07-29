import React from 'react';

const Navigation = ({ 
  children, 
  className = "", 
  topOffset = "top-16",
  zIndex = "z-40" 
}) => {
  return (
    <div 
      className={`p-4 sticky ${topOffset} ${zIndex} border-b border-gray-200 bg-white/95 backdrop-blur-sm rounded-t-lg shadow-xl transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

export default Navigation;