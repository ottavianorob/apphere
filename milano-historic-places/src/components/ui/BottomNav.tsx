import React from 'react';
import { MapIcon, PlayCircleIcon, CogIcon } from 'lucide-react';

type Tab = 'map' | 'playlists' | 'profile';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: 'map', Icon: MapIcon, label: 'Mappa' },
  { id: 'playlists', Icon: PlayCircleIcon, label: 'Playlist' },
  { id: 'profile', Icon: CogIcon, label: 'Profilo' }
];

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-newspaper-bg/95 backdrop-blur-md border-t border-accent-gold flex justify-around py-2">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id as Tab)}
          className={`flex flex-col items-center text-xs sm:text-sm transition-colors duration-200
            ${activeTab === tab.id ? 'text-accent-bordeaux' : 'text-text-secondary hover:text-accent-gold'}`}
        >
          <tab.Icon size={24} />
          <span className="mt-1 font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}