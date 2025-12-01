import React from 'react';

const PathIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M18 6.983c-2.389 0-4.448 1.635-5.264 3.924"/>
    <path d="M12.668 11.267a6.502 6.502 0 0 0-5.651 5.922"/>
    <path d="M7 17.214c-1.512 0-2.883-1.01-3.465-2.523"/>
    <path d="M19 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
    <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
    <path d="M4 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
  </svg>
);

export default PathIcon;
