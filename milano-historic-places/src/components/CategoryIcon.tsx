// src/components/CategoryIcon.tsx
import React from 'react';
import { categoryConfig, CategoryKey } from '../config/categories';

type Props = {
  category: string;
  className?: string;
  withBackground?: boolean; // se true, mostra icona con sfondo circolare
  size?: number; // dimensione icona in px, default 20
  ariaLabel?: string; // etichetta per screen reader
};

export default function CategoryIcon({ category, className = '', withBackground = false, size = 20, ariaLabel }: Props) {
  const key = category as CategoryKey;
  const cfg = categoryConfig[key];
  if (!cfg) {
    console.warn(`Categoria non configurata: ${category}`);
    return null;
  }
  // Import del file SVG tramite URL
  // Assicura di avere i file SVG in src/assets/icons con i nomi corretti
  const iconPath = new URL(`../assets/icons/${cfg.icon}`, import.meta.url).href;

  const iconStyle = { width: `${size}px`, height: `${size}px` };

  if (withBackground) {
    const bgSize = size + 8;
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-newspaper-bg border border-accent-gold shadow-sm ${className}`}
        style={{ width: `${bgSize}px`, height: `${bgSize}px` }}
        aria-label={ariaLabel || category}
      >
        <img src={iconPath} alt="" style={iconStyle} className={cfg.colorClass} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={iconPath}
      alt={ariaLabel || category}
      style={iconStyle}
      className={cfg.colorClass + ' ' + className}
    />
  );
}
