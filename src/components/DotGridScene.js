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
  const [isVRSupported, setIsVRSupported] = useState(false);
  const intervalRef = useRef(null);
  const sceneRef = useRef(null);
  const xStep = 0.08038;
  const yStep = 0.08038;

  function createMatrix(MATRIX_DIMENSION = 10) {
    const rows = MATRIX_DIMENSION;
    const cols = MATRIX_DIMENSION;
    const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Define the number of ones for each row in the upper half
    const upperRowsOnes = [4, 6, 8, 10, 10];

    // Fill the upper half of the matrix
    for (let i = 0; i < 5; i++) {
      const onesCount = upperRowsOnes[i];
      const startIdx = Math.floor((cols - onesCount) / 2);
      for (let j = startIdx; j < startIdx + onesCount; j++) {
        matrix[i][j] = 1;
      }
    }

    // Mirror the upper half to the lower half (water image)
    for (let i = 5; i < rows; i++) {
      matrix[i] = [...matrix[rows - 1 - i]];
    }

    return matrix;
  }

  const createRandomDot = () => {
    const matrix = createMatrix();
    const rows = matrix.length;
    const cols = matrix[0].length;
    // Get all the positions where matrix value is 1
    const onesPositions = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (matrix[row][col] === 1) {
          onesPositions.push({ row, col });
        }
      }
    }
    // Choose a random position from the ones positions
    const randomPosition = onesPositions[Math.floor(Math.random() * onesPositions.length)];
    const x = (randomPosition.col - (cols - 1) / 2) * xStep;
    const y = (randomPosition.row - (rows - 1) / 2) * yStep;
    setDotPosition({ x, y });
  };

  useEffect(() => {
    intervalRef.current = setInterval(createRandomDot, 200);
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then(supported => {
        setIsVRSupported(supported);
      });
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleVRButtonClick = () => {
    const scene = sceneRef.current;
    if (scene) {
      scene.enterVR();
    }
  };

  return (
    <div className="relative w-full h-screen">
      {isVRSupported && (
        <button 
          onClick={handleVRButtonClick}
          className="absolute top-4 right-4 z-50 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Enter VR
        </button>
      )}
      
      <AFrameScene>
        <a-scene 
          ref={sceneRef}
          embedded 
          vr-mode-ui="enabled: true" 
          xrdebug
        >
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

          {/* Standard VR entry button */}
          <a-entity 
            id="vrButton" 
            visible="false" 
            position="0 1.6 -2"
          >
            <a-gui-button
              width="1"
              height="0.5"
              position="0 0 0"
              onclick="document.querySelector('a-scene').enterVR()"
              key-code="32"
              value="Enter VR"
            ></a-gui-button>
          </a-entity>
        </a-scene>
      </AFrameScene>
    </div>
  );
};

export default DotGridScene;
