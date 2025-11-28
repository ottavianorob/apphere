import React from 'react';

const ArrowUpIcon: React.FC<{ className?: string, style?: React.CSSProperties }> = ({ className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

export default ArrowUpIcon;