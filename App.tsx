import React, { useState, useEffect } from 'react';
import { Poi, Point, Path, Area } from './types';
import { points as mockPoints, paths as mockPaths, categories, periods, areas as mockAreas } from './data/mockData';
import MapView from './components/MapView';
import SettingsView from './components/SettingsView';
import BottomNav from './components/BottomNav';
import PoiDetailModal from './components/PoiDetailModal';

export type View = 'map' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('map');
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  
  // Combine all POIs into a single array
  const allPois: Poi[] = [...mockPoints, ...mockPaths, ...mockAreas];

  useEffect(() => {
    if (selectedPoi) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function to restore scroll on component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPoi]);

  const renderView = () => {
    switch (currentView) {
      case 'map':
        return <MapView 
          pois={allPois}
          onSelectPoi={setSelectedPoi} 
          categories={categories} 
          periods={periods} 
          allPoints={mockPoints}
        />;
      case 'settings':
        return <SettingsView />;
      default:
        return <MapView 
          pois={allPois}
          onSelectPoi={setSelectedPoi} 
          categories={categories} 
          periods={periods}
          allPoints={mockPoints}
        />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-6 pb-24">
        {renderView()}
      </main>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      {selectedPoi && (
        <PoiDetailModal 
          poi={selectedPoi} 
          onClose={() => setSelectedPoi(null)} 
          categories={categories}
          allPoints={mockPoints}
        />
      )}
    </div>
  );
};

export default App;