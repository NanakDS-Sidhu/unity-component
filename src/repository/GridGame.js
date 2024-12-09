import React, { useState, useEffect, useRef, useCallback } from 'react';

class Dot {
  constructor(x, y, intensity = 0) {
    this.position = { x, y };
    this.intensity = intensity;
  }
}

export const useDotGridGame = () => {
  // Constants
  const MATRIX_DIMENSION = 10;
  const UNIT = 0.08038;
  const BOUND = UNIT * 4.5;
  const INTENSITY_UNIT = 1 / 34;
  const FIXATION_LIMIT = 4;

  const [dots, setDots] = useState([]);
  const [maxIntensity, setMaxIntensity] = useState(
    Array.from({ length: MATRIX_DIMENSION }, () =>
      Array.from({ length: MATRIX_DIMENSION }, () => -1)
    )
  );
  const [currentDot, setCurrentDot] = useState(null);
  const [gameState, setGameState] = useState({
    started: false,
    dotPressed: false,
    pressCount: 0,
    eye: 'Left'
  });

  const get2DMatrix = useCallback((n, m, defaultValue = -1) => {
    return Array.from({ length: n }, () =>
      Array.from({ length: m }, () => defaultValue)
    );
  }, []);

  const getMatrixIndices = useCallback(
    (dot) => {
      const nx = Math.round((dot.position.x + BOUND) / UNIT);
      const ny = Math.round((dot.position.y + BOUND) / UNIT);
      return [9 - ny, nx];
    },
    [BOUND, UNIT]
  );

  const isBlindSpot = useCallback(
    (dot) => {
      const [i, j] = getMatrixIndices(dot);
      return gameState.eye === 'Left'
        ? i === 5 && j === 2
        : i === 5 && j === 7;
    },
    [gameState.eye, getMatrixIndices]
  );

  const convertIntensity = useCallback((i) => {
    i = 1.2 - i;
    return Math.round(((i - 0.2) / (1.0 - 0.2)) * 34 + 1);
  }, []);

  const initializeDots = useCallback(() => {
    const initialDots = [];
    const initialMaxIntensity = get2DMatrix(MATRIX_DIMENSION, MATRIX_DIMENSION);

    for (let x = -BOUND; x <= BOUND; x += UNIT) {
      for (let y = -BOUND; y <= BOUND; y += UNIT) {
        const dot = new Dot(x, y);
        const [i, j] = getMatrixIndices(dot);

        const isTopRow = i < 3 && i + j >= 3 && i + j <= 2 * i + 6;
        const isMiddleRow = i >= 3 && i <= 6;
        const isBottomRow = i > 6 && i + j <= 15 && i + j >= 2 * i - 6;

        if (isTopRow || isMiddleRow || isBottomRow) {
          initialDots.push(dot);
          initialMaxIntensity[i][j] = 0;
        }
      }
    }

    setDots(initialDots);
    setMaxIntensity(initialMaxIntensity);
    setGameState((prev) => ({
      ...prev,
      eye: Math.random() > 0.5 ? 'Left' : 'Right'
    }));
  }, [BOUND, UNIT, get2DMatrix, getMatrixIndices]);

  const displayDots = useCallback(async () => {
    let remainingDots = [...dots];
    let dotsPressed = 0;
    let blindSpotPressed = 0;
    let totalDotsShown = 0;

    while (remainingDots.length > 0) {
      totalDotsShown++;

      // Choose and remove a random dot
      const randomIndex = Math.floor(Math.random() * remainingDots.length);
      const dot = remainingDots.splice(randomIndex, 1)[0];

      // Simulate dot display
      setCurrentDot(dot);

      // Wait and check if dot was pressed
      await new Promise((resolve) => {
        setTimeout(() => {
          const [i, j] = getMatrixIndices(dot);

          if (isBlindSpot(dot)) {
            if (gameState.dotPressed) {
              blindSpotPressed++;
              dotsPressed++;
            }

            if (blindSpotPressed > FIXATION_LIMIT) {
              resolve();
              return;
            }

            dot.intensity += 3 * INTENSITY_UNIT;
            if (dot.intensity <= 1) remainingDots.push(dot);
          } else if (gameState.dotPressed) {
            dotsPressed++;
            setMaxIntensity((prev) => {
              const newIntensity = [...prev];
              newIntensity[i][j] = convertIntensity(dot.intensity);
              return newIntensity;
            });
          } else {
            dot.intensity += (Math.random() <= 2 / 3 ? 1 : 2) * INTENSITY_UNIT;
            if (dot.intensity <= 1) remainingDots.push(dot);
            else {
              setMaxIntensity((prev) => {
                const newIntensity = [...prev];
                newIntensity[i][j] = 0;
                return newIntensity;
              });
            }
          }

          setGameState((prev) => ({ ...prev, dotPressed: false }));
          resolve();
        }, 600); // 150ms display + 450ms press window
      });

      // Random break between dots
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * (900 - 550) + 550)
      );
    }

    // Calculate results
    const falsePositive = Math.round(
      ((gameState.pressCount - dotsPressed) * 100) / gameState.pressCount
    );
    const falseNegative = Math.round(
      ((totalDotsShown - dotsPressed) * 100) / totalDotsShown
    );

    const result = {
      maxIntensity,
      falsePositive,
      falseNegative,
      failedFixation: blindSpotPressed > FIXATION_LIMIT
    };

    console.log(result);
    return result;
  }, [dots, gameState.dotPressed, gameState.pressCount, getMatrixIndices, isBlindSpot, convertIntensity]);

  const startGame = useCallback(async () => {
    // Counter
    for (let counter = 3; counter > 0; counter--) {
      console.log(counter);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setGameState((prev) => ({ ...prev, started: true }));
    await displayDots();
  }, [displayDots]);

  const pressDot = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      pressCount: prev.pressCount + 1,
      dotPressed: currentDot !== null && !prev.dotPressed
    }));
  }, [currentDot]);

  useEffect(() => {
    initializeDots();
  }, [initializeDots]);

  return {
    startGame,
    pressDot,
    currentDot,
    gameState,
    dots,
    maxIntensity
  };
};
