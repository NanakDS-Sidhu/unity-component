import React from 'react';

const DotGrid = () => {
  const rows = 8;
  const cols = 9;

  return (
    <>
      {[...Array(rows)].map((_, row) => 
        [...Array(cols)].map((_, col) => {
          // Calculate position
          const x = (col - (cols - 1) / 2) * 0.1;
          const y = (row - (rows - 1) / 2) * 0.1;

          return (
            <a-entity
              key={`dot-${row}-${col}`}
              geometry="primitive: sphere; radius: 0.005"
              material="color: gray; opacity: 0.5"
              position={`${x} ${y} -1`}
            ></a-entity>
          );
        })
      )}
    </>
  );
};

export default DotGrid;