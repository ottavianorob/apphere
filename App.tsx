
import React, { useState } from 'react';
import { Point, Itinerary } from './types';
import { points as mockPoints, itineraries as mockItineraries, categories, periods } from './data/mockData';
import MapView from './components/MapView';
import ItinerariesView from './components/ItinerariesView';
import SettingsView from './components/SettingsView';
import BottomNav from './components/BottomNav';
import PointDetailModal from './components/PointDetailModal';

export type View = 'map' | 'itineraries' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('map');
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

  const renderView = () => {
    switch (currentView) {
      case 'map':
        return <MapView points={mockPoints} onSelectPoint={setSelectedPoint} categories={categories} periods={periods} />;
      case 'itineraries':
        return <ItinerariesView itineraries={mockItineraries} onSelectPoint={setSelectedPoint}/>;
      case 'settings':
        return <SettingsView />;
      default:
        return <MapView points={mockPoints} onSelectPoint={setSelectedPoint} categories={categories} periods={periods}/>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-6 pb-24">
        {renderView()}
      </main>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      {selectedPoint && (
        <PointDetailModal point={selectedPoint} onClose={() => setSelectedPoint(null)} />
      )}
    </div>
  );
};

export default App;
