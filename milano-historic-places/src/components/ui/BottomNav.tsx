// src/components/ui/BottomNav.tsx
import { useState } from 'react';
import { MapIcon, PlayCircleIcon, CogIcon } from 'lucide-react';

const tabs = [
  { id: 'map', Icon: MapIcon, label: 'Mappa' },
  { id: 'playlists', Icon: PlayCircleIcon, label: 'Playlist' },
  { id: 'profile', Icon: CogIcon, label: 'Profilo' },
];

export default function BottomNav() {
  const [active, setActive] = useState('map');
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t flex justify-around py-2">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActive(tab.id)}
          className={`flex flex-col items-center text-sm ${
            active === tab.id ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <tab.Icon size={24} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}