import React, { useState, useMemo } from 'react';
import { Poi, Category, Period } from '../types';
import PoiListItem from './PoiListItem';
import SearchIcon from './icons/SearchIcon';

interface SearchViewProps {
  allPois: Poi[];
  categories: Category[];
  periods: Period[];
  onSelectPoi: (poi: Poi) => void;
  categoryMap: Map<string, string>;
}

const SearchView: React.FC<SearchViewProps> = ({ allPois, categories, periods, onSelectPoi, categoryMap }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);

  const filteredPois = useMemo(() => {
    return allPois.filter(poi => {
      const searchMatch = searchTerm.length < 2 || 
        poi.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        poi.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const categoryMatch = selectedCategories.length === 0 || poi.categoryIds.some(id => selectedCategories.includes(id));
      const periodMatch = selectedPeriods.length === 0 || selectedPeriods.includes(poi.periodId);

      return searchMatch && categoryMatch && periodMatch;
    });
  }, [searchTerm, selectedCategories, selectedPeriods, allPois]);

  const handleFilterToggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, id: string) => {
    setter(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div>
      <header className="mb-8 border-b-2 border-[#2D3748] pb-4">
        <h1 className="font-sans-display text-4xl sm:text-5xl font-bold text-[#2D3748] text-center tracking-tighter">Ricerca</h1>
        <div className="relative mt-4 max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Cerca per nome, luogo, descrizione..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-400 bg-transparent focus:ring-2 focus:ring-[#134A79] focus:border-[#134A79] outline-none"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </header>
      
      {/* Filters */}
      <div className="mb-6 space-y-4">
          <div>
              <h3 className="font-serif-display text-lg italic text-gray-700 mb-2 text-center">Filtra per Categoria</h3>
              <div className="font-sans-display flex flex-wrap gap-2 justify-center">
              {categories.map(category => (
                  <button 
                      key={category.id}
                      onClick={() => handleFilterToggle(setSelectedCategories, category.id)}
                      className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${selectedCategories.includes(category.id) ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                      {category.name}
                  </button>
              ))}
              </div>
          </div>
          <div>
              <h3 className="font-serif-display text-lg italic text-gray-700 mb-2 text-center">Filtra per Periodo</h3>
              <div className="font-sans-display flex flex-wrap gap-2 justify-center">
                  {periods.map(period => (
                       <button key={period.id} onClick={() => handleFilterToggle(setSelectedPeriods, period.id)}
                          className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${selectedPeriods.includes(period.id) ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'}`}>
                          {period.name}
                      </button>
                  ))}
              </div>
          </div>
      </div>


      {/* Results */}
      <div className="border-t border-gray-300 pt-4">
        <h3 className="font-sans-display font-bold text-lg mb-2">
            Risultati ({filteredPois.length})
        </h3>
        {filteredPois.length > 0 ? (
          filteredPois.map(poi => (
            <PoiListItem
              key={poi.id}
              poi={poi}
              onSelect={() => onSelectPoi(poi)}
              categories={categories}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-600 font-sans-display">
            <p className="font-semibold">Nessun risultato trovato.</p>
            <p className="text-sm">Prova a modificare i termini di ricerca o i filtri.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;