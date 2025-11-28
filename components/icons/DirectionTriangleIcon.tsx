import React from 'react';

const DirectionTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0 L24 24 L0 24 Z" transform="rotate(180 12 12)" />
  </svg>
);

export default DirectionTriangleIcon;