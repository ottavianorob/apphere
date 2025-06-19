import { useEffect, useState } from 'react';
import { MapIcon, PlayCircleIcon, CogIcon, SunIcon, MoonIcon, MonitorIcon } from 'lucide-react';

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
  // Dark mode switch stato
  const [darkMode, setDarkMode] = useState<'auto' | 'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'auto' | 'dark' | 'light') || 'auto';
  });
  useEffect(() => {
    if (darkMode === 'auto') {
      document.body.classList.remove('dark');
      // Rilancia la funzione auto dark mode
      if ((window as any).applyAutoDarkMode) (window as any).applyAutoDarkMode();
    } else if (darkMode === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', darkMode);
  }, [darkMode]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-newspaper-bg/95 dark:bg-gradient-to-t dark:from-[#18151a]/95 dark:to-[#23202a]/95 backdrop-blur-md border-t border-accent-gold dark:border-accent-gold flex justify-around py-2 md:static md:top-0 md:left-0 md:right-0 md:max-w-4xl md:mx-auto md:rounded-b-xl md:shadow-lg">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id as Tab)}
          className={`flex flex-col items-center text-xs sm:text-sm md:text-base transition-colors duration-200 font-heading tracking-wide
            ${activeTab === tab.id ? 'text-accent-bordeaux dark:text-accent-gold' : 'text-text-secondary dark:text-accent-gold hover:text-accent-gold dark:hover:text-accent-bordeaux'}`}
        >
          <tab.Icon size={28} className="md:w-8 md:h-8" />
          <span className="mt-1 font-heading uppercase tracking-wider text-[0.8em] md:text-base">{tab.label}</span>
        </button>
      ))}
      {/* Switch dark mode solo su tab Profilo */}
      {activeTab === 'profile' && (
        <div className="flex items-center gap-2 ml-4">
          <label className="text-xs text-text-secondary dark:text-accent-gold">Tema:</label>
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDarkMode('auto')}
              className={`p-1 rounded-full border ${darkMode === 'auto' ? 'bg-accent-gold text-accent-bordeaux border-accent-gold' : 'bg-neutral-light dark:bg-[#18151a] text-text-primary dark:text-accent-gold border-accent-gold'} transition focus:outline-none focus:ring-2 focus:ring-accent-gold`}
              aria-label="Tema automatico"
            >
              <MonitorIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => setDarkMode('light')}
              className={`p-1 rounded-full border ${darkMode === 'light' ? 'bg-accent-gold text-accent-bordeaux border-accent-gold' : 'bg-neutral-light dark:bg-[#18151a] text-text-primary dark:text-accent-gold border-accent-gold'} transition focus:outline-none focus:ring-2 focus:ring-accent-gold`}
              aria-label="Tema chiaro"
            >
              <SunIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => setDarkMode('dark')}
              className={`p-1 rounded-full border ${darkMode === 'dark' ? 'bg-accent-gold text-accent-bordeaux border-accent-gold' : 'bg-neutral-light dark:bg-[#18151a] text-text-primary dark:text-accent-gold border-accent-gold'} transition focus:outline-none focus:ring-2 focus:ring-accent-gold`}
              aria-label="Tema scuro"
            >
              <MoonIcon size={18} />
            </button>
          </span>
        </div>
      )}
    </nav>
  );
}