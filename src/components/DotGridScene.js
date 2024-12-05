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
    const rows = 8;
    const cols = 9;

    const xStep = 0.1;
    const yStep = 0.1;

    const randomCol = Math.floor(Math.random() * cols);
    const randomRow = Math.floor(Math.random() * rows);

    const x = (randomCol - (cols - 1) / 2) * xStep;
    const y = (randomRow - (rows - 1) / 2) * yStep;

    setDotPosition({ x, y });
  };

  useEffect(() => {
    createRandomDot();
    intervalRef.current = setInterval(createRandomDot, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleEnterVR = () => {
    const scene = document.querySelector('a-scene');
    if (scene && scene.enterVR) {
      scene.enterVR();
    }
  };

  return (
    <div className="w-full h-screen" onClick={handleEnterVR}>
      <AFrameScene>
        <a-scene embedded vr-mode-ui="enabled: true" xrdebug>
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
        </a-scene>
      </AFrameScene>
    </div>
  );
};

export default DotGridScene;
