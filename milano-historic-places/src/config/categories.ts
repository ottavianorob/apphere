// src/config/categories.ts

export type CategoryKey = 
  | 'Storia & Patrimonio'
  | 'Arte & Cultura'
  | 'Cronaca & Società'
  | 'Cinema & TV'
  | 'Musica & Spettacolo';

export interface CategoryConfigItem {
  icon: string;      // nome file SVG in src/assets/icons/
  colorClass: string; // classe Tailwind per colore
}

export const categoryConfig: Record<CategoryKey, CategoryConfigItem> = {
  'Storia & Patrimonio': { icon: 'history.svg',         colorClass: 'text-accent-blue' },
  'Arte & Cultura':      { icon: 'art.svg',             colorClass: 'text-accent-blue' },
  'Cronaca & Società':   { icon: 'news.svg',            colorClass: 'text-accent-brown' },
  'Cinema & TV':         { icon: 'cinema.svg',          colorClass: 'text-accent-brown' },
  'Musica & Spettacolo': { icon: 'music.svg',           colorClass: 'text-accent-brown' },
};