import React from 'react';
import { View } from '../App';
import MapPinIcon from './icons/MapPinIcon';
import SettingsIcon from './icons/SettingsIcon';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'text-[#134A79]';
  const inactiveClasses = 'text-gray-500 hover:text-[#2D3748]';
  
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className={`text-xs mt-1 ${isActive ? 'font-bold' : ''}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-[#FAF7F0]/80 backdrop-blur-sm border-t border-gray-300 z-50">
      <nav className="flex items-center justify-around h-full max-w-lg mx-auto">
        <NavItem
          label="Mappa"
          icon={<MapPinIcon className="w-6 h-6" />}
          isActive={currentView === 'map'}
          onClick={() => setCurrentView('map')}
        />
        <NavItem
          label="Impostazioni"
          icon={<SettingsIcon className="w-6 h-6" />}
          isActive={currentView === 'settings'}
          onClick={() => setCurrentView('settings')}
        />
      </nav>
    </footer>
  );
};

export default BottomNav;