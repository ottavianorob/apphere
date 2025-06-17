import { useState } from 'react';
import { MapIcon, PlayCircleIcon, CogIcon } from 'lucide-react';

const tabs = [
  { id: 'map', Icon: MapIcon, label: 'Mappa' },
  { id: 'playlists', Icon: PlayCircleIcon, label: 'Playlist' },
  { id: 'profile', Icon: CogIcon, label: 'Profilo' }
];

export default function BottomNav() {
  const [active, setActive] = useState<string>('map');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-around py-2">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActive(tab.id)}
          className={`flex flex-col items-center text-xs sm:text-sm transition-colors duration-200
            ${active === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <tab.Icon size={24} />
          <span className="mt-1 font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}