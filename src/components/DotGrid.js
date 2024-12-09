import React from 'react';

const DotGrid = () => {
  const MATRIX_DIMENSION = 10;
  const UNIT = 0.08038;
  const BOUND = UNIT * 4.5;

  // Function to create the matrix
  function createMatrix(MATRIX_DIMENSION) {
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

  // Create the matrix
  const matrix = createMatrix(MATRIX_DIMENSION);

  return (
    <>
      {matrix.map((row, rowIndex) => (
        row.map((cell, colIndex) => {
          // Calculate position based on the provided constraints
          const x = (colIndex - (MATRIX_DIMENSION - 1) / 2) * UNIT;  // Adjusted with UNIT
          const y = (rowIndex - (MATRIX_DIMENSION - 1) / 2) * UNIT;  // Adjusted with UNIT

          // Apply the BOUND constraints (positioning should be within this range)
          const constrainedX = Math.min(Math.max(x, -BOUND), BOUND);
          const constrainedY = Math.min(Math.max(y, -BOUND), BOUND);

          // Check if the current cell should have a dot (1 or 0)
          return cell === 1 ? (
            <a-entity
              key={`dot-${rowIndex}-${colIndex}`}
              geometry="primitive: sphere; radius: 0.005"
              material="color: gray; opacity: 0.5"
              position={`${constrainedX} ${constrainedY} -1`}  // Adjusted position within bounds
            ></a-entity>
          ) : null; // If cell is 0, don't render anything
        })
      ))}
    </>
  );
};

export default DotGrid;

