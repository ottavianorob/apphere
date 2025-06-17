// scripts/validateData.js
import fs from 'fs';
import path from 'path';

console.log('🚀 Avvio validazione JSON…');

let places, itineraries;
try {
  places = JSON.parse(
    fs.readFileSync(path.resolve('public/places.json'), 'utf-8')
  );
  itineraries = JSON.parse(
    fs.readFileSync(path.resolve('public/itineraries.json'), 'utf-8')
  );
} catch (err) {
  console.error('❌ Errore nel parsing dei JSON:', err.message);
  process.exit(1);
}

const ids = new Set(places.map(p => p.id));
let ok = true;

for (const [slug, itin] of Object.entries(itineraries)) {
  if (!Array.isArray(itin.stops)) {
    console.error(`❌ Itinerario "${slug}" ha stops NON valido`);
    ok = false;
    continue;
  }
  itin.stops.forEach(id => {
    if (!ids.has(id)) {
      console.error(`❌ Tappa "${id}" non trovata (itinerario ${slug})`);
      ok = false;
    }
  });
}

if (ok) {
  console.log('✅ Dati coerenti!');
  process.exit(0);
} else {
  console.error('❌ Validazione fallita.');
  process.exit(1);
}