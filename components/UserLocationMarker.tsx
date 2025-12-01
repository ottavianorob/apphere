import React from 'react';

interface UserLocationMarkerProps {
  heading: number | null | undefined;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ heading }) => {
  // Mostra un punto statico se l'orientamento non è disponibile
  if (heading === null || heading === undefined) {
    return (
      <div 
        className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white" 
        title="La tua posizione" 
      />
    );
  }

  // Mostra un marcatore direzionale se l'orientamento è disponibile
  return (
    <div 
      className="transition-transform duration-500 ease-linear"
      style={{ transform: `rotate(${heading}deg)` }}
      title="La tua posizione e direzione"
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M16 2 L28 28 L16 22 L4 28 L16 2 Z" 
          fill="#2563EB" 
          stroke="white" 
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default UserLocationMarker;