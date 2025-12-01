import React, { useState, useEffect } from 'react';
import { Poi, Itinerary } from './types';
import { points, paths, categories, periods, areas, itineraries } from './data/mockData';
import MapView from './components/MapView';
import SettingsView from './components/SettingsView';
import BottomNav from './components/BottomNav';
import PoiDetailModal from './components/PoiDetailModal';
import ItinerariesView from './components/ItinerariesView';
import ItineraryDetailModal from './components/ItineraryDetailModal';

export type View = 'map' | 'itineraries' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('map');
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  
  const allPois: Poi[] = [...points, ...paths, ...areas];

  useEffect(() => {
    const isModalOpen = selectedPoi || selectedItinerary;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPoi, selectedItinerary]);

  const renderView = () => {
    switch (currentView) {
      case 'map':
        return <MapView 
          pois={allPois}
          onSelectPoi={setSelectedPoi} 
          categories={categories} 
          periods={periods} 
        />;
      case 'itineraries':
        return <ItinerariesView 
          itineraries={itineraries}
          onSelectItinerary={setSelectedItinerary}
        />;
      case 'settings':
        return <SettingsView />;
      default:
        return <MapView 
          pois={allPois}
          onSelectPoi={setSelectedPoi} 
          categories={categories} 
          periods={periods}
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
        />
      )}
      {selectedItinerary && (
        <ItineraryDetailModal
          itinerary={selectedItinerary}
          allPois={allPois}
          onClose={() => setSelectedItinerary(null)}
          onSelectPoiInItinerary={setSelectedPoi}
        />
      )}
    </div>
  );
};

export default App;