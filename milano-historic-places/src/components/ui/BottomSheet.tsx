// src/components/ui/BottomSheet.tsx
import CategoryIcon from '../../components/CategoryIcon';
import type { Place, Photo, Character } from '../types';
import { motion } from 'framer-motion';

interface Props {
  place: Place;
  photos?: Photo[];
  characters?: Character[];
  onClose: () => void;
}

export default function BottomSheet({ place, photos = [], characters = [], onClose }: Props) {
  const formattedDate = place.date ? new Date(place.date).toLocaleDateString() : null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 max-h-[90%] bg-newspaper-bg dark:bg-gradient-to-br dark:from-[#18151a] dark:to-[#23202a] rounded-t-2xl shadow-2xl flex flex-col overflow-hidden z-50
        md:fixed md:top-1/2 md:left-8 md:transform md:-translate-y-1/2 md:w-[35%] md:max-h-[85%] md:rounded-xl md:border md:border-accent-gold dark:border-accent-gold md:overflow-auto"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Drag handle */}
        <div className="self-center w-12 h-1.5 bg-neutral-light dark:bg-accent-gold mt-2 rounded-full mb-2" />
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="px-6 pt-2 pb-4 flex items-center justify-between">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-heading text-text-primary dark:text-accent-gold mb-1 leading-tight break-words">{place.title}</h2>
              <div className="flex items-center space-x-2 text-sm mb-2">
                <CategoryIcon category={place.category} className="w-5 h-5" ariaLabel={place.category} />
                <span className="px-2 py-1 bg-accent-bordeaux dark:bg-accent-gold text-white dark:text-accent-bordeaux font-heading text-xs rounded" style={{letterSpacing: '0.04em'}}>{place.category}</span>
                {formattedDate && <span className="text-text-secondary dark:text-accent-gold">{formattedDate}</span>}
              </div>
              {place.tags && place.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {place.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs uppercase bg-neutral-light dark:bg-[#23202a] text-text-primary dark:text-accent-gold px-2 py-1 rounded border border-accent-gold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Chiudi dettagli"
              className="text-text-secondary dark:text-accent-gold hover:text-text-primary dark:hover:text-accent-bordeaux"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Photos */}
          {photos.length === 1 && (
            <div className="px-6 pb-2 flex justify-center">
              <img
                src={photos[0].url}
                alt={photos[0].caption}
                className="w-full max-w-md h-48 object-cover rounded-xl border border-neutral-light dark:border-accent-gold"
              />
            </div>
          )}
          {photos.length > 1 && (
            <div className="px-6 py-2">
              <div className="flex overflow-x-auto space-x-3 pb-2">
                {photos.map(photo => (
                  <div key={photo.id} className="flex-shrink-0">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-40 h-24 object-cover rounded-xl border border-neutral-light dark:border-accent-gold"
                    />
                    {photo.caption && (
                      <p className="font-body mt-1 text-xs text-text-secondary dark:text-accent-gold text-center">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Teaser / Description */}
          {place.teaser && (
            <div className="px-6 py-4 border-t dark:border-accent-gold">
              <p className="font-body text-lg text-text-primary dark:text-accent-gold leading-relaxed">{place.teaser}</p>
            </div>
          )}
          {/* Characters list */}
          {characters.length > 0 && (
            <div className="px-6 py-4 border-t dark:border-accent-gold">
              <h3 className="text-base font-semibold text-text-primary dark:text-accent-gold mb-2">Personaggi</h3>
              <div className="flex overflow-x-auto space-x-4">
                {characters.map(char => (
                  <div key={char.id} className="flex-shrink-0 text-center w-24">
                    <img
                      src={char.image}
                      alt={char.name}
                      className="w-14 h-14 object-cover rounded-full mx-auto border border-neutral-light dark:border-accent-gold bg-white dark:bg-[#23202a]"
                    />
                    <span className="font-body mt-1 block text-sm text-text-primary dark:text-accent-gold font-semibold">{char.name}</span>
                    {char.links && char.links.length > 0 && (
                      <a
                        href={char.links[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent-bordeaux dark:text-accent-gold underline hover:text-accent-gold dark:hover:text-accent-bordeaux"
                      >
                        {char.links[0].label}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
