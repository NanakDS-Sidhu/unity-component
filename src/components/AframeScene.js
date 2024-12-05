// Separate component for A-Frame Scene wrapper (A-Frame requires direct DOM manipulation)
'use client';

import React, { useEffect, useRef } from 'react';
import 'aframe';

const AFrameScene = ({ children }) => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Ensure A-Frame is loaded
    if (typeof window !== 'undefined') {
      require('aframe');
    }
  }, []);

  return (
    <a-scene ref={sceneRef} className="w-full h-full">
      {children}
    </a-scene>
  );
};

export default AFrameScene;