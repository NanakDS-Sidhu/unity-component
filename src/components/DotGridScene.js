'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import A-Frame to ensure it only loads on client-side
const AFrameScene = dynamic(() => import("@/components/AframeScene"), { 
  ssr: false 
});

const DotGridScene = () => {
  const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
  const intervalRef = useRef(null);

  const createRandomDot = () => {
    // Generate random x and y between -1 and 1
    const x = (Math.random() - 0.5) * 2;
    const y = (Math.random() - 0.5) * 2;
    
    setDotPosition({ x, y });
  };

  useEffect(() => {
    // Create first dot immediately
    createRandomDot();

    // Set interval to change dot every second
    intervalRef.current = setInterval(createRandomDot, 1000);

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-screen">
      <AFrameScene>
        {/* Black sky */}
        <a-sky color="black"></a-sky>

        {/* Center red dot */}
        <a-entity
          geometry="primitive: sphere; radius: 0.01"
          material="color: red; opacity: 1"
          position="0 0 -1"
        ></a-entity>

        {/* Dynamic yellow dot */}
        <a-sphere
          radius="0.01"
          color="yellow"
          position={`${dotPosition.x} ${dotPosition.y} -1`}
        ></a-sphere>

        {/* Camera */}
        <a-camera 
          position="0 0 0" 
          look-controls 
          wasd-controls
        ></a-camera>
      </AFrameScene>
    </div>
  );
};

export default DotGridScene;