import React from 'react';
import { View } from '../App';
import MapPinIcon from './icons/MapPinIcon';
import RouteIcon from './icons/RouteIcon';
import SearchIcon from './icons/SearchIcon';
import UserIcon from './icons/UserIcon';
import UsersIcon from './icons/UsersIcon';

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
      <span className={`text-xs mt-1 font-sans-display ${isActive ? 'font-bold' : ''}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-[#FAF7F0]/80 backdrop-blur-sm border-t border-gray-300 z-50">
      <nav className="flex items-center justify-around h-full max-w-lg mx-auto">
        <NavItem
          label="Qui"
          icon={<MapPinIcon className="w-6 h-6" />}
          isActive={currentView === 'qui'}
          onClick={() => setCurrentView('qui')}
        />
        <NavItem
          label="Itinerari"
          icon={<RouteIcon className="w-6 h-6" />}
          isActive={currentView === 'itineraries'}
          onClick={() => setCurrentView('itineraries')}
        />
        <NavItem
          label="Ricerca"
          icon={<SearchIcon className="w-6 h-6" />}
          isActive={currentView === 'search'}
          onClick={() => setCurrentView('search')}
        />
        <NavItem
          label="Community"
          icon={<UsersIcon className="w-6 h-6" />}
          isActive={currentView === 'home'}
          onClick={() => setCurrentView('home')}
        />
        <NavItem
          label="Profilo"
          icon={<UserIcon className="w-6 h-6" />}
          isActive={currentView === 'profile'}
          onClick={() => setCurrentView('profile')}
        />
      </nav>
    </footer>
  );
};

export default BottomNav;