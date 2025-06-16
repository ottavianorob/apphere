// scripts/validateData.js
import fs from 'fs';
import path from 'path';

const places = JSON.parse(
  fs.readFileSync(path.resolve('public/places.json'), 'utf-8')
);
const itineraries = JSON.parse(
  fs.readFileSync(path.resolve('public/itineraries.json'), 'utf-8')
);

const ids = new Set(places.map(p => p.id));
let ok = true;

for (const [slug, itin] of Object.entries(itineraries)) {
  itin.stops.forEach(id => {
    if (!ids.has(id)) {
      console.error(`❌  "${id}" non esiste (itinerario: ${slug})`);
      ok = false;
    }
  });
}

if (ok) {
  console.log('✅  Dati coerenti');
}
process.exit(ok ? 0 : 1);