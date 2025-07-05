import React, { useState, useEffect } from 'react';

let currentWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

const updateWidth = () => {
  if (typeof window !== 'undefined') {
    currentWidth = window.innerWidth;
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('resize', updateWidth);
}

export const getCurrentDeviceWidth = () => {
  updateWidth(); // Ensure the width is updated before returning
  return currentWidth;
};

// Example usage in another component
// import { getCurrentDeviceWidth } from 'src/components/CurrentViewPort/CurrentViewPort';
// const deviceWidth = getCurrentDeviceWidth();
// console.log('Current device width:', deviceWidth);

const CurrentViewPort = () => {
  const [width, setWidth] = useState(getCurrentDeviceWidth());

  useEffect(() => {
    const handleResize = () => {
      setWidth(getCurrentDeviceWidth());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return (
    <div>
      <p>Current device width: {width}px</p>
    </div>
  );
};

export default CurrentViewPort;


