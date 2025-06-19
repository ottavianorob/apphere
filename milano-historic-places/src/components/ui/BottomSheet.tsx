// src/components/ui/BottomSheet.tsx
import CategoryIcon from '../../components/CategoryIcon';
import type { Place, Photo, Character } from '../types';

interface Props {
  place: Place;
  photos?: Photo[];
  characters?: Character[];
  onClose: () => void;
}

export default function BottomSheet({ place, photos = [], characters = [], onClose }: Props) {
  const formattedDate = place.date ? new Date(place.date).toLocaleDateString() : null;

  return (
    <div className="fixed inset-x-0 bottom-0 max-h-[90%] bg-newspaper-bg rounded-t shadow-2xl flex flex-col
      md:fixed md:top-1/2 md:right-4 md:transform md:-translate-y-1/2 md:w-1/3 md:max-h-[80%] md:rounded-l shadow-lg border border-accent-gold">
      {/* Drag handle */}
      <div className="self-center w-12 h-1.5 bg-neutral-light mt-2 rounded" />

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex-1 pr-4">
          <h2 className="text-2xl font-heading text-text-primary mb-1 leading-tight">{place.title}</h2>
          <div className="flex items-center space-x-2 text-sm mb-2">
            <CategoryIcon category={place.category} className="w-5 h-5" ariaLabel={place.category} />
            <span className="px-2 py-1 bg-accent-bordeaux text-white font-heading text-xs rounded" style={{letterSpacing: '0.04em'}}>{place.category}</span>
            {formattedDate && <span className="text-text-secondary">{formattedDate}</span>}
          </div>
          {place.tags && place.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {place.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs uppercase bg-neutral-light text-text-primary px-2 py-1 rounded border border-accent-gold"
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
          className="text-text-secondary hover:text-text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Photos carousel */}
      {photos.length > 0 && (
        <div className="px-6 py-2">
          <div className="flex overflow-x-auto space-x-3 pb-2">
            {photos.map(photo => (
              <div key={photo.id} className="flex-shrink-0">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-40 h-24 object-cover rounded-xl border border-neutral-light"
                />
                {photo.caption && (
                  <p className="font-body mt-1 text-xs text-text-secondary text-center">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teaser / Description */}
      {place.teaser && (
        <div className="px-6 py-3 border-t">
          <p className="font-body text-text-primary leading-relaxed">{place.teaser}</p>
        </div>
      )}

      {/* Characters list */}
      {characters.length > 0 && (
        <div className="px-6 py-4 border-t">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Personaggi</h3>
          <div className="flex overflow-x-auto space-x-4">
            {characters.map(char => (
              <div key={char.id} className="flex-shrink-0 text-center">
                <img
                  src={char.image}
                  alt={char.name}
                  className="w-12 h-12 object-cover rounded-full mx-auto"
                />
                <span className="font-body mt-1 block text-sm text-text-primary">{char.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 border-t flex justify-end">
        {place.teaser && (
          <button
            // Sostituisci con un link reale se disponibile, oppure lascia il bottone disabilitato
            onClick={() => {}}
            className="bg-accent-bordeaux text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-gold hover:text-accent-bordeaux transition opacity-50 cursor-not-allowed"
            disabled
          >
            Approfondisci
          </button>
        )}
      </div>
    </div>
  );
}
