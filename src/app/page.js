'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to ensure client-side rendering
const DotGridScene = dynamic(() => import('@/components/DotGridScene'), {
  ssr: false,
  loading: () => <p className="text-center mt-20 text-xl">Loading VR Scene...</p>
});

export default function VRPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="p-4 bg-black text-white text-center">
        <h1 className="text-2xl font-bold">A-Frame Dot Grid VR Experience</h1>
      </header>
      
      <main className="flex-grow">
        <DotGridScene />
      </main>
      
      <footer className="p-4 bg-black text-white text-center">
        <p>Navigate using WASD keys or mouse look controls</p>
      </footer>
    </div>
  );
}