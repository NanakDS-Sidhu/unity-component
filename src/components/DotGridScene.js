'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import DotGrid from '@/components/DotGrid';

const AFrameScene = dynamic(() => import("@/components/AframeScene"), { 
  ssr: false 
});

const DotGridScene = () => {
  const redPos = { x: 0, y: 0 };
  const [dotPosition, setDotPosition] = useState({ x: redPos.x, y: redPos.y });
  const intervalRef = useRef(null);

  const createRandomDot = () => {
    // Grid dimensions
    const rows = 8;
    const cols = 9;

    // Calculate precise grid positioning
    const xStep = 0.1;
    const yStep = 0.1;

    // Generate random column and row
    const randomCol = Math.floor(Math.random() * cols);
    const randomRow = Math.floor(Math.random() * rows);

    // Calculate x and y positions
    const x = (randomCol - (cols - 1) / 2) * xStep;
    const y = (randomRow - (rows - 1) / 2) * yStep;

    setDotPosition({ x, y });
  };

  useEffect(() => {
    // Create first dot immediately
    createRandomDot();

    // Set interval to change dot every 200ms
    intervalRef.current = setInterval(createRandomDot, 200);

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Automatically enter VR mode when the scene is loaded
    const enterVR = () => {
      const scene = document.querySelector('a-scene');
      if (scene && scene.enterVR) {
        scene.enterVR();
      }
    };

    window.addEventListener('load', enterVR);

    return () => {
      window.removeEventListener('load', enterVR);
    };
  }, []);

  return (
    <div className="w-full h-screen">
      <AFrameScene>
        <a-entity
          id="rig"
          position="0 1.6 0"
          movement-controls="fly: true"
        >
          <a-camera
            look-controls
            wasd-controls
            position="0 0 0"
          >
            {/* UI Elements */}
            <a-entity
              position="0 -0.5 -1"
              geometry="primitive: plane; width: 1; height: 0.5"
              material="color: #444; opacity: 0.7"
            >
              <a-text
                value="You are in VR mode"
                align="center"
                color="#fff"
                position="0 0 0.1"
                scale="0.5 0.5 0.5"
              ></a-text>
            </a-entity>

            {/* Black sky */}
            <a-sky color="black"></a-sky>

            <DotGrid></DotGrid>

            {/* Center red dot */}
            <a-entity
              geometry="primitive: sphere; radius: 0.005"
              material="color: red; opacity: 1"
              position={`${redPos.x} ${redPos.y} -1`}
            ></a-entity>

            {/* Dynamic yellow dot */}
            <a-sphere
              radius="0.005"
              color="yellow"
              position={`${dotPosition.x} ${dotPosition.y} -1`}
            ></a-sphere>
          </a-camera>
        </a-entity>
      </AFrameScene>
    </div>
  );
};

export default DotGridScene;
