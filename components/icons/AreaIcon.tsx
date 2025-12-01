import React from 'react';

const AreaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 9.5V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h5.5"/>
    <path d="M14.121 20.121a3 3 0 1 0-4.242-4.242 3 3 0 0 0 4.242 4.242z"/>
    <path d="M14 14l-1.5 7.5 7.5-1.5-6-6z"/>
  </svg>
);

export default AreaIcon;
