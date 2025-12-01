import React, { useMemo } from 'react';
import { Poi, Itinerary, User } from '../types';
import PoiListItem from './PoiListItem';

interface HomeViewProps {
  allPois: Poi[];
  allItineraries: Itinerary[];
  allUsers: User[];
  onSelectPoi: (poi: Poi) => void;
  onSelectItinerary: (itinerary: Itinerary) => void;
  onSelectTag: (tag: string) => void;
  categoryMap: Map<string, string>;
}

const HomeView: React.FC<HomeViewProps> = ({ allPois, allItineraries, allUsers, onSelectPoi, onSelectItinerary, onSelectTag, categoryMap }) => {

  const latestPois = useMemo(() => {
    return [...allPois]
      .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
      .slice(0, 3);
  }, [allPois]);

  const featuredItinerary = useMemo(() => {
    // For now, just pick the first one as "featured"
    return allItineraries.length > 0 ? allItineraries[0] : null;
  }, [allItineraries]);

  const popularTags = useMemo(() => {
    const tagCounts: { [key: string]: number } = {};
    allPois.forEach(p => p.tags?.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; }));
    allItineraries.forEach(i => i.tags?.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; }));
    return Object.entries(tagCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 7)
      .map(([tag]) => tag);
  }, [allPois, allItineraries]);

  const activeUsers = useMemo(() => {
    return [...allUsers]
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 5);
  }, [allUsers]);

  return (
    <div>
      <header className="mb-8 border-b-2 border-[#2D3748] pb-4 text-center">
        <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#2D3748] tracking-tighter">Community</h1>
        <p className="font-serif-display italic text-lg text-gray-700 mt-2">Esplora i contenuti creati dagli utenti</p>
      </header>

      {/* Active Users section */}
      <section className="mb-10">
        <h2 className="font-serif-display text-2xl italic text-gray-800 mb-4">Utenti più attivi</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          {activeUsers.map(user => (
            <div key={user.id} className="flex-shrink-0 flex flex-col items-center w-24 text-center">
              <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-gray-300" />
              <span className="font-sans-display text-sm font-semibold text-gray-800 line-clamp-1">{user.name}</span>
              <span className="font-sans-display text-xs text-gray-600">{user.contributions} contributi</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Itinerary */}
      {featuredItinerary && (
        <section className="mb-10 cursor-pointer group" onClick={() => onSelectItinerary(featuredItinerary)}>
          <h2 className="font-serif-display text-2xl italic text-gray-800 mb-4">Itinerario in Evidenza</h2>
          <div className="relative">
            <img src={featuredItinerary.coverPhoto.url} alt={featuredItinerary.coverPhoto.caption} className="w-full h-56 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <h3 className="font-sans-display text-2xl font-bold">{featuredItinerary.title}</h3>
              <p className="font-serif-display text-sm line-clamp-2">{featuredItinerary.description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Latest POIs */}
      <section className="mb-10">
        <h2 className="font-serif-display text-2xl italic text-gray-800 mb-2">Ultimi Luoghi Aggiunti</h2>
        <div>
          {latestPois.map(poi => (
            <PoiListItem 
              key={poi.id}
              poi={poi}
              onSelect={() => onSelectPoi(poi)}
              categoryName={categoryMap.get(poi.categoryId)}
            />
          ))}
        </div>
      </section>

      {/* Popular Tags */}
      <section>
        <h2 className="font-serif-display text-2xl italic text-gray-800 mb-4">Tag Popolari</h2>
        <div className="flex flex-wrap gap-2">
          {popularTags.map(tag => (
            <button 
              key={tag} 
              onClick={() => onSelectTag(tag)}
              className="bg-gray-500/10 text-gray-600 px-3 py-1 text-sm font-sans-display font-semibold hover:bg-gray-500/20 transition-colors"
            >
              #{tag.toUpperCase().replace(/\s+/g, '')}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeView;