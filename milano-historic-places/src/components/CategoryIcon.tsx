// src/components/CategoryIcon.tsx
import React from 'react';
import { categoryConfig, CategoryKey } from '../config/categories';

type Props = {
  category: string;
  className?: string;
  withBackground?: boolean; // se true, mostra icona con sfondo circolare
};

export default function CategoryIcon({ category, className = '', withBackground = false }: Props) {
  const key = category as CategoryKey;
  const cfg = categoryConfig[key];
  if (!cfg) {
    console.warn(`Categoria non configurata: ${category}`);
    return null;
  }
  // Import del file SVG tramite URL
  // Assicura di avere i file SVG in src/assets/icons con i nomi corretti
  const iconPath = new URL(`../assets/icons/${cfg.icon}`, import.meta.url).href;

  // Costruisci classi per icona
  const iconClasses = `w-5 h-5 ${cfg.colorClass} ${className}`;

  if (withBackground) {
    // Sfondo circolare chiaro con bordo neutro
    return (
      <div className={`w-6 h-6 flex items-center justify-center rounded-full bg-warm-bg border border-neutral-light ${className}`}>
        <img src={iconPath} alt={category} className="w-4 h-4" />
      </div>
    );
  }

  return <img src={iconPath} alt={category} className={iconClasses} />;
}
