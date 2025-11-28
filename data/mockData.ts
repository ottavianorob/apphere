import { Point, Category, Period, Character, Itinerary } from '../types';

export const categories: Category[] = [
  { id: 'storia', name: 'Storia & Patrimonio' },
  { id: 'arte', name: 'Arte & Cultura' },
  { id: 'societa', name: 'Cronaca & Società' },
  { id: 'cinema', name: 'Cinema & TV' },
  { id: 'musica', name: 'Musica & Spettacolo' },
];

export const periods: Period[] = [
  { id: 'rinascimento', name: 'Rinascimento' },
  { id: 'resistenza', name: 'Resistenza (1943-1945)' },
  { id: 'boom', name: 'Dopoguerra e Boom Economico' },
  { id: 'anni60', name: 'Anni \'60' },
  { id: 'anni70', name: 'Anni di Piombo (\'70)' },
];

export const characters: Character[] = [
  { id: 'pertini', name: 'Sandro Pertini', description: 'Partigiano e 7º Presidente della Repubblica Italiana', wikipediaUrl: 'https://it.wikipedia.org/wiki/Sandro_Pertini', profileImageUrl: 'https://picsum.photos/seed/pertini_char/100/100' },
  { id: 'leonardo', name: 'Leonardo da Vinci', description: 'Artista e inventore del Rinascimento', wikipediaUrl: 'https://it.wikipedia.org/wiki/Leonardo_da_Vinci', profileImageUrl: 'https://picsum.photos/seed/leonardo_char/100/100' },
  { id: 'visconti', name: 'Luchino Visconti', description: 'Regista, sceneggiatore e scrittore', wikipediaUrl: 'https://it.wikipedia.org/wiki/Luchino_Visconti', profileImageUrl: 'https://picsum.photos/seed/visconti_char/100/100' },
  { id: 'toscanini', name: 'Arturo Toscanini', description: 'Direttore d\'orchestra di fama mondiale', wikipediaUrl: 'https://it.wikipedia.org/wiki/Arturo_Toscanini', profileImageUrl: 'https://picsum.photos/seed/toscanini_char/100/100' },
];

export const points: Point[] = [
  // Categoria: Società
  {
    id: 'm1',
    creationDate: '2023-11-01T10:00:00Z',
    author: 'Admin',
    coordinates: { latitude: 45.464204, longitude: 9.189982 },
    periodId: 'anni70',
    categoryId: 'societa',
    title: 'Strage di Piazza Fontana',
    location: 'Milano',
    eventDate: '12 dicembre 1969',
    description: 'Il 12 dicembre 1969, una bomba esplose nella sede della Banca Nazionale dell\'Agricoltura in Piazza Fontana, causando 17 morti e 88 feriti. Questo evento è considerato l\'inizio della "strategia della tensione" e degli Anni di Piombo in Italia.',
    photos: [
      { id: 'ph_m1_1', url: 'https://picsum.photos/seed/fontana/800/600', caption: 'Piazza Fontana oggi' },
      { id: 'ph_m1_2', url: 'https://picsum.photos/seed/fontana_detail/800/600', caption: 'Un dettaglio della piazza' },
      { id: 'ph_m1_3', url: 'https://picsum.photos/seed/fontana_archive/800/600', caption: 'Immagine d\'archivio' }
    ],
    linkedCharacterIds: [],
    tags: ['terrorismo', 'strategia della tensione', 'milano', 'cronaca nera'],
  },
  // Categoria: Musica
  {
    id: 'm2',
    creationDate: '2023-11-01T11:00:00Z',
    author: 'UserMusicFan',
    coordinates: { latitude: 45.4674, longitude: 9.1883 },
    periodId: 'boom',
    categoryId: 'musica',
    title: 'La Scala rinasce con Toscanini',
    location: 'Milano',
    eventDate: '11 maggio 1946',
    description: 'L\'11 maggio 1946, il Teatro alla Scala, gravemente danneggiato dai bombardamenti del 1943, riaprì con un memorabile concerto diretto da Arturo Toscanini. L\'evento simboleggiò la rinascita culturale di Milano e dell\'Italia intera dopo la guerra.',
    photos: [{ id: 'ph_m2', url: 'https://picsum.photos/seed/scala/800/600', caption: 'Il Teatro alla Scala' }],
    linkedCharacterIds: ['toscanini'],
    tags: ['musica classica', 'ricostruzione', 'dopoguerra', 'teatro'],
  },
  // Categoria: Arte
  {
    id: 'm3',
    creationDate: '2023-11-01T12:00:00Z',
    author: 'ArtExplorer',
    coordinates: { latitude: 45.4664, longitude: 9.176 },
    periodId: 'rinascimento',
    categoryId: 'arte',
    title: 'L\'Ultima Cena di Leonardo',
    location: 'Milano',
    eventDate: '1495-1498',
    description: 'Nel refettorio del convento di Santa Maria delle Grazie, Leonardo da Vinci dipinse uno dei più grandi capolavori della storia dell\'arte: l\'Ultima Cena. L\'opera monumentale è celebre per la sua profondità psicologica e innovazione compositiva.',
    photos: [
      { id: 'ph_m3_1', url: 'https://picsum.photos/seed/cenacolo/800/600', caption: 'Il convento di Santa Maria delle Grazie' },
      { id: 'ph_m3_2', url: 'https://picsum.photos/seed/cenacolo_interior/800/600', caption: 'Interno del refettorio' }
    ],
    linkedCharacterIds: ['leonardo'],
    tags: ['rinascimento', 'affresco', 'capolavoro', 'unesco'],
  },
  // Categoria: Storia
  {
    id: 'm4',
    creationDate: '2023-11-01T13:00:00Z',
    author: 'HistoryBuff',
    coordinates: { latitude: 45.4849, longitude: 9.2173 },
    periodId: 'resistenza',
    categoryId: 'storia',
    title: 'La fine del fascismo in Piazzale Loreto',
    location: 'Milano',
    eventDate: '29 aprile 1945',
    description: 'Piazzale Loreto divenne un luogo simbolo della fine della Seconda Guerra Mondiale in Italia quando, il 29 aprile 1945, i corpi di Benito Mussolini, Claretta Petacci e altri gerarchi fascisti furono esposti pubblicamente. Questo evento segnò la liberazione definitiva dal regime.',
    photos: [{ id: 'ph_m4', url: 'https://picsum.photos/seed/loreto/800/600', caption: 'Piazzale Loreto oggi' }],
    linkedCharacterIds: ['pertini'],
    tags: ['liberazione', 'fascismo', 'seconda guerra mondiale', 'partigiani'],
  },
  // Categoria: Cinema
  {
    id: 'm5',
    creationDate: '2023-11-01T14:00:00Z',
    author: 'Cinephile',
    coordinates: { latitude: 45.4655, longitude: 9.1898 },
    periodId: 'boom',
    categoryId: 'cinema',
    title: 'Rocco e i suoi fratelli in Galleria',
    location: 'Milano',
    eventDate: '1960',
    description: 'La Galleria Vittorio Emanuele II è stata una delle location principali del capolavoro di Luchino Visconti, "Rocco e i suoi fratelli". Le scene girate qui catturano l\'energia e le contraddizioni di una Milano in pieno boom economico.',
    photos: [
      { id: 'ph_m5_1', url: 'https://picsum.photos/seed/galleria/800/600', caption: 'La Galleria Vittorio Emanuele II' },
      { id: 'ph_m5_2', url: 'https://picsum.photos/seed/galleria_floor/800/600', caption: 'Il mosaico del toro' },
      { id: 'ph_m5_3', url: 'https://picsum.photos/seed/galleria_night/800/600', caption: 'La Galleria di notte' },
      { id: 'ph_m5_4', url: 'https://picsum.photos/seed/galleria_roof/800/600', caption: 'La cupola della Galleria' }
    ],
    linkedCharacterIds: ['visconti'],
    tags: ['neorealismo', 'cinema italiano', 'boom economico', 'location'],
  },
  // Categoria: Società / Storia
  {
    id: 'm6',
    creationDate: '2023-11-01T15:00:00Z',
    author: 'Admin',
    coordinates: { latitude: 45.485, longitude: 9.2052 },
    periodId: 'resistenza',
    categoryId: 'societa',
    title: 'Il Binario 21 e la Memoria della Shoah',
    location: 'Milano',
    eventDate: '1943-1945',
    description: 'Dal binario 21 della Stazione Centrale di Milano, tra il 1943 e il 1945, migliaia di ebrei e deportati politici furono caricati su vagoni merci e inviati ai campi di sterminio. Oggi è un potente memoriale per non dimenticare.',
    photos: [{ id: 'ph_m6', url: 'https://picsum.photos/seed/binario21/800/600', caption: 'Memoriale della Shoah' }],
    linkedCharacterIds: [],
    tags: ['shoah', 'memoria', 'deportazione', 'olocausto'],
  },
  // Categoria: Arte
  {
    id: 'm7',
    creationDate: '2023-11-01T16:00:00Z',
    author: 'ArtExplorer',
    coordinates: { latitude: 45.4719, longitude: 9.1884 },
    periodId: 'boom',
    categoryId: 'arte',
    title: 'La nascita della Grande Brera',
    location: 'Milano',
    eventDate: 'Anni \'70',
    description: 'La Pinacoteca di Brera, cuore artistico di Milano, ha conosciuto un\'importante espansione e riorganizzazione negli anni \'70, sotto la direzione di Franco Russoli. Questo periodo ha consolidato il suo ruolo come uno dei più importanti musei italiani, aprendosi a un pubblico più vasto.',
    photos: [{ id: 'ph_m7', url: 'https://picsum.photos/seed/brera/800/600', caption: 'Cortile della Pinacoteca di Brera' }],
    linkedCharacterIds: [],
    tags: ['museo', 'pittura', 'arte moderna', 'cultura'],
  },
  // Categoria: Storia
  {
    id: 'm8',
    creationDate: '2023-11-01T17:00:00Z',
    author: 'HistoryBuff',
    coordinates: { latitude: 45.4646, longitude: 9.1916 },
    periodId: 'resistenza',
    categoryId: 'storia',
    title: 'Il discorso della Liberazione in Piazza Duomo',
    location: 'Milano',
    eventDate: '28 aprile 1945',
    description: 'Il 28 aprile 1945, Sandro Pertini e altri leader del Comitato di Liberazione Nazionale tennero un appassionato discorso in una Piazza Duomo gremita, celebrando la liberazione della città dal nazifascismo. Un momento che ha segnato la storia della Repubblica Italiana.',
    photos: [{ id: 'ph_m8', url: 'https://picsum.photos/seed/duomo_lib/800/600', caption: 'Piazza del Duomo a Milano' }],
    linkedCharacterIds: ['pertini'],
    tags: ['25 aprile', 'liberazione', 'antifascismo', 'discorso storico'],
  },
  // Categoria: Musica
  {
    id: 'm9',
    creationDate: '2023-11-01T18:00:00Z',
    author: 'UserMusicFan',
    coordinates: { latitude: 45.4789, longitude: 9.1436 },
    periodId: 'anni60',
    categoryId: 'musica',
    title: 'I Beatles al Velodromo Vigorelli',
    location: 'Milano',
    eventDate: '24 giugno 1965',
    description: 'Nel giugno del 1965, i Beatles tennero due concerti al Velodromo Vigorelli di Milano, unica tappa italiana del loro tour europeo. Fu un evento epocale che portò la Beatlemania in Italia e segnò un\'intera generazione.',
    photos: [
      { id: 'ph_m9_1', url: 'https://picsum.photos/seed/vigorelli/800/600', caption: 'Velodromo Vigorelli' },
      { id: 'ph_m9_2', url: 'https://picsum.photos/seed/vigorelli_stage/800/600', caption: 'Il palco del concerto' },
      { id: 'ph_m9_3', url: 'https://picsum.photos/seed/vigorelli_crowd/800/600', caption: 'Il pubblico in attesa' }
    ],
    linkedCharacterIds: [],
    tags: ['rock', 'beatles', 'concerto', 'cultura giovanile'],
  },
  // Categoria: Cinema
  {
    id: 'm10',
    creationDate: '2023-11-01T19:00:00Z',
    author: 'Cinephile',
    coordinates: { latitude: 45.4705, longitude: 9.2045 },
    periodId: 'boom', 
    categoryId: 'cinema',
    title: 'Villa Necchi Campiglio, set di "Io sono l\'amore"',
    location: 'Milano',
    eventDate: '2009',
    description: 'Questa splendida villa degli anni \'30, gioiello dell\'architettura razionalista, è stata la sontuosa ambientazione del film "Io sono l\'amore" di Luca Guadagnino. La villa è diventata un personaggio a sé, rappresentando l\'eleganza e la decadenza dell\'alta borghesia milanese.',
    photos: [{ id: 'ph_m10', url: 'https://picsum.photos/seed/necchi/800/600', caption: 'Piscina di Villa Necchi Campiglio' }],
    linkedCharacterIds: [],
    tags: ['architettura', 'design', 'location cinematografica', 'guadagnino'],
  },
];

export const itineraries: Itinerary[] = [
  {
    id: 'it_m1',
    title: 'Milano: Memorie della Seconda Guerra Mondiale',
    description: 'Un percorso toccante attraverso i luoghi simbolo di Milano che raccontano la Resistenza, la deportazione e la Liberazione.',
    estimatedDuration: '2.5 ore',
    pointIds: ['m4', 'm6', 'm8'],
  },
  {
    id: 'it_m2',
    title: 'Milano: Palcoscenici di Arte e Cultura',
    description: 'Dal Rinascimento al cinema d\'autore, un itinerario che esplora i luoghi dove l\'arte, la musica e il cinema hanno fatto la storia di Milano.',
    estimatedDuration: '4 ore',
    pointIds: ['m3', 'm2', 'm5', 'm7'],
  },
];