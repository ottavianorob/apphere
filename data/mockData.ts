import { Point, Category, Period, Character, Path, Area, Itinerary, User } from '../types';

/*
export const categories: Category[] = [
  { id: 'storia', name: 'Storia & Patrimonio' },
  { id: 'arte', name: 'Arte & Cultura' },
  { id: 'societa', name: 'Cronaca & Società' },
  { id: 'cinema', name: 'Cinema & TV' },
  { id: 'musica', name: 'Musica & Spettacolo' },
];

export const periods: Period[] = [
  { id: 'risorgimento', name: 'Risorgimento' },
  { id: 'belleepoque', name: 'Belle Époque (1871-1914)' },
  { id: 'primog dopoguerra', name: 'Primo Dopoguerra (1919-1922)' },
  { id: 'resistenza', name: 'Resistenza (1943-1945)' },
  { id: 'boom', name: 'Dopoguerra e Boom Economico' },
  { id: 'anni60', name: 'Anni \'60' },
  { id: 'anni70', name: 'Anni di Piombo (\'70)' },
  { id: 'anni90', name: 'Anni \'90' },
];

export const characters: Character[] = [
  { 
    id: 'pertini', 
    name: 'Sandro Pertini', 
    description: 'Partigiano e 7º Presidente della Repubblica Italiana', 
    wikipediaUrl: 'https://it.wikipedia.org/wiki/Sandro_Pertini', 
    photos: [
      { id: 'ph_pertini_1', url: 'https://picsum.photos/seed/pertini_char/800/600', caption: 'Ritratto di Sandro Pertini' },
      { id: 'ph_pertini_2', url: 'https://picsum.photos/seed/pertini_char_2/800/600', caption: 'Sandro Pertini durante un discorso pubblico' }
    ] 
  },
  { 
    id: 'leonardo', 
    name: 'Leonardo da Vinci', 
    description: 'Artista e inventore del Rinascimento', 
    wikipediaUrl: 'https://it.wikipedia.org/wiki/Leonardo_da_Vinci', 
    photos: [
      { id: 'ph_leonardo_1', url: 'https://picsum.photos/seed/leonardo_char/800/600', caption: 'Autoritratto di Leonardo da Vinci' }
    ] 
  },
  { 
    id: 'visconti', 
    name: 'Luchino Visconti', 
    description: 'Regista, sceneggiatore e scrittore', 
    wikipediaUrl: 'https://it.wikipedia.org/wiki/Luchino_Visconti', 
    photos: [
      { id: 'ph_visconti_1', url: 'https://picsum.photos/seed/visconti_char/800/600', caption: 'Luchino Visconti sul set' }
    ] 
  },
  { 
    id: 'toscanini', 
    name: 'Arturo Toscanini', 
    description: 'Direttore d\'orchestra di fama mondiale', 
    wikipediaUrl: 'https://it.wikipedia.org/wiki/Arturo_Toscanini', 
    photos: [
      { id: 'ph_toscanini_1', url: 'https://picsum.photos/seed/toscanini_char/800/600', caption: 'Arturo Toscanini dirige l\'orchestra' },
      { id: 'ph_toscanini_2', url: 'https://picsum.photos/seed/toscanini_char_2/800/600', caption: 'Un primo piano di Toscanini' },
      { id: 'ph_toscanini_3', url: 'https://picsum.photos/seed/toscanini_char_3/800/600', caption: 'Toscanini durante le prove' }
    ] 
  },
   { 
    id: 'tobagi', 
    name: 'Walter Tobagi', 
    description: 'Giornalista e scrittore, vittima del terrorismo', 
    wikipediaUrl: 'https://it.wikipedia.org/wiki/Walter_Tobagi', 
    photos: [
      { id: 'ph_tobagi_1', url: 'https://picsum.photos/seed/tobagi_char/800/600', caption: 'Ritratto di Walter Tobagi' }
    ] 
  },
];

export const points: Point[] = [
  // Categoria: Società
  {
    id: 'm1',
    type: 'point',
    creationDate: '2023-11-01T10:00:00Z',
    author: 'Admin',
    coordinates: { latitude: 45.464204, longitude: 9.189982 },
    periodId: 'anni60',
    categoryIds: ['societa', 'storia'],
    title: 'Strage di Piazza Fontana',
    location: 'Milano',
    eventDate: '12 dicembre 1969',
    description: 'Il 12 dicembre 1969, una bomba esplose nella sede della Banca Nazionale dell\'Agricoltura in Piazza Fontana, causando 17 morti e 88 feriti. Questo evento è considerato l\'inizio della "strategia della tensione" e degli Anni di Piombo in Italia.',
    photos: [
      { id: 'ph_m1_1', url: 'https://picsum.photos/seed/fontana/800/600', caption: 'Piazza Fontana oggi' },
      { id: 'ph_m1_2', url: 'https://picsum.photos/seed/fontana_detail/800/600', caption: 'Un dettaglio della piazza' },
      { id: 'ph_m1_3', url: 'https://picsum.photos/seed/fontana_archive/800/600', caption: 'Immagine d\'archivio' }
    ],
    linkedCharacterIds: ['pertini'],
    tags: ['terrorismo', 'strategia della tensione', 'milano', 'cronaca nera'],
  },
  // Categoria: Storia
  {
    id: 'm2',
    type: 'point',
    creationDate: '2024-01-15T10:00:00Z',
    author: 'HistoryBuff',
    coordinates: { latitude: 45.5748, longitude: 9.2736 },
    periodId: 'belleepoque',
    categoryIds: ['storia'],
    title: 'L\'assassinio di Re Umberto I',
    location: 'Monza',
    eventDate: '29 luglio 1900',
    description: 'All\'esterno della Villa Reale di Monza, l\'anarchico Gaetano Bresci sparò e uccise Re Umberto I di Savoia. L\'attentato scosse profondamente l\'Italia e segnò un punto di svolta politico all\'inizio del XX secolo.',
    photos: [{ id: 'ph_m2_1', url: 'https://picsum.photos/seed/monza_reg/800/600', caption: 'La Villa Reale di Monza' }],
    linkedCharacterIds: [],
    tags: ['regicidio', 'anarchismo', 'storia italiana', 'savoia'],
  },
  // Categoria: Storia
  {
    id: 'm3',
    type: 'point',
    creationDate: '2024-01-15T11:00:00Z',
    author: 'HistoryBuff',
    coordinates: { latitude: 45.4647, longitude: 9.1856 },
    periodId: 'primog dopoguerra',
    categoryIds: ['storia'],
    title: 'La fondazione dei Fasci di Combattimento',
    location: 'Piazza San Sepolcro, Milano',
    eventDate: '23 marzo 1919',
    description: 'In una sala riunioni affacciata su Piazza San Sepolcro, Benito Mussolini fondò i Fasci italiani di combattimento. Questo evento è considerato l\'atto di nascita del movimento fascista, che avrebbe tragicamente segnato la storia italiana ed europea.',
    photos: [{ id: 'ph_m3_1', url: 'https://picsum.photos/seed/sansepolcro/800/600', caption: 'Piazza San Sepolcro' }],
    linkedCharacterIds: [],
    tags: ['fascismo', 'mussolini', 'storia politica', 'milano'],
  },
  // Categoria: Storia
  {
    id: 'm4',
    type: 'point',
    creationDate: '2023-11-01T13:00:00Z',
    author: 'HistoryBuff',
    coordinates: { latitude: 45.4849, longitude: 9.2173 },
    periodId: 'resistenza',
    categoryIds: ['storia', 'societa'],
    title: 'La fine del fascismo in Piazzale Loreto',
    location: 'Milano',
    eventDate: '29 aprile 1945',
    description: 'Piazzale Loreto divenne un luogo simbolo della fine della Seconda Guerra Mondiale in Italia quando, il 29 aprile 1945, i corpi di Benito Mussolini, Claretta Petacci e altri gerarchi fascisti furono esposti pubblicamente. Questo evento segnò la liberazione definitiva dal regime.',
    photos: [{ id: 'ph_m4', url: 'https://picsum.photos/seed/loreto/800/600', caption: 'Piazzale Loreto oggi' }],
    linkedCharacterIds: ['pertini'],
    tags: ['liberazione', 'fascismo', 'seconda guerra mondiale', 'partigiani'],
  },
  // Categoria: Società
  {
    id: 'm5',
    type: 'point',
    creationDate: '2024-01-15T12:00:00Z',
    author: 'Cinephile',
    coordinates: { latitude: 45.4800, longitude: 9.2110 },
    periodId: 'primog dopoguerra',
    categoryIds: ['societa', 'storia'],
    title: 'La strage del Teatro Diana',
    location: 'Corso Buenos Aires, Milano',
    eventDate: '23 marzo 1921',
    description: 'Una bomba, piazzata da anarchici individualisti, esplose all\'ingresso del Teatro Diana, causando 21 morti e oltre 80 feriti tra il pubblico. Fu uno dei più sanguinosi attentati del turbolento Biennio Rosso.',
    photos: [{ id: 'ph_m5_1', url: 'https://picsum.photos/seed/diana_teatro/800/600', caption: 'L\'area del ex-Teatro Diana oggi' }],
    linkedCharacterIds: ['toscanini'],
    tags: ['anarchismo', 'biennio rosso', 'violenza politica', 'milano'],
  },
  // Categoria: Società / Storia
  {
    id: 'm6',
    type: 'point',
    creationDate: '2023-11-01T15:00:00Z',
    author: 'Admin',
    coordinates: { latitude: 45.485, longitude: 9.2052 },
    periodId: 'resistenza',
    categoryIds: ['storia', 'societa'],
    title: 'Il Binario 21 e la Memoria della Shoah',
    location: 'Milano',
    eventDate: '1943-1945',
    description: 'Dal binario 21 della Stazione Centrale di Milano, tra il 1943 e il 1945, migliaia di ebrei e deportati politici furono caricati su vagoni merci e inviati ai campi di sterminio. Oggi è un potente memoriale per non dimenticare.',
    photos: [{ id: 'ph_m6', url: 'https://picsum.photos/seed/binario21/800/600', caption: 'Memoriale della Shoah' }],
    linkedCharacterIds: [],
    tags: ['shoah', 'memoria', 'deportazione', 'olocausto'],
  },
    // Categoria: Società
  {
    id: 'm7',
    type: 'point',
    creationDate: '2024-01-15T14:00:00Z',
    author: 'Admin',
    coordinates: { latitude: 45.4628, longitude: 9.1912 },
    periodId: 'anni60',
    categoryIds: ['societa', 'storia'],
    title: 'L\'occupazione della Statale del \'68',
    location: 'Università Statale, Milano',
    eventDate: 'marzo 1968',
    description: 'L\'Università Statale di Milano fu uno degli epicentri del movimento studentesco del \'68 in Italia. Le sue occupazioni e le assemblee infuocate divennero un simbolo della contestazione giovanile contro l\'autoritarismo accademico e sociale.',
    photos: [{ id: 'ph_m7_1', url: 'https://picsum.photos/seed/statale68/800/600', caption: 'Il cortile della "Ca\' Granda", sede dell\'Università Statale' }],
    linkedCharacterIds: [],
    tags: ['sessantotto', 'movimento studentesco', 'protesta', 'università'],
  },
  // Categoria: Storia
  {
    id: 'm8',
    type: 'point',
    creationDate: '2023-11-01T17:00:00Z',
    author: 'HistoryBuff',
    coordinates: { latitude: 45.4646, longitude: 9.1916 },
    periodId: 'resistenza',
    categoryIds: ['storia'],
    title: 'Il discorso della Liberazione in Piazza Duomo',
    location: 'Milano',
    eventDate: '28 aprile 1945',
    description: 'Il 28 aprile 1945, Sandro Pertini e altri leader del Comitato di Liberazione Nazionale tennero un appassionato discorso in una Piazza Duomo gremita, celebrando la liberazione della città dal nazifascismo. Un momento che ha segnato la storia della Repubblica Italiana.',
    photos: [{ id: 'ph_m8', url: 'https://picsum.photos/seed/duomo_lib/800/600', caption: 'Piazza del Duomo a Milano' }],
    linkedCharacterIds: ['pertini'],
    tags: ['25 aprile', 'liberazione', 'antifascismo', 'discorso storico'],
  },
  // Categoria: Società
  {
    id: 'm9',
    type: 'point',
    creationDate: '2024-01-15T15:00:00Z',
    author: 'Admin',
    coordinates: { latitude: 45.4682, longitude: 9.1663 },
    periodId: 'anni70',
    categoryIds: ['societa', 'storia'],
    title: 'L\'omicidio di Walter Tobagi',
    location: 'Via Salaino, Milano',
    eventDate: '28 maggio 1980',
    description: 'Il giornalista del Corriere della Sera Walter Tobagi, noto per le sue analisi lucide sul terrorismo, fu assassinato vicino a casa sua dalla "Brigata XXVIII marzo", un gruppo terroristico di sinistra. La sua morte fu un duro colpo per il giornalismo e la società civile.',
    photos: [{ id: 'ph_m9_1', url: 'https://picsum.photos/seed/tobagi_via/800/600', caption: 'Via Salaino, luogo dell\'agguato' }],
    linkedCharacterIds: ['tobagi', 'pertini'],
    tags: ['terrorismo', 'anni di piombo', 'giornalismo', 'milano'],
  },
  // Categoria: Società
  {
    id: 'm10',
    type: 'point',
    creationDate: '2024-01-15T16:00:00Z',
    author: 'Admin',
    coordinates: { latitude: 45.4565, longitude: 9.1678 },
    periodId: 'anni90',
    categoryIds: ['societa', 'storia'],
    title: 'L\'inizio di Mani Pulite',
    location: 'Pio Albergo Trivulzio, Milano',
    eventDate: '17 febbraio 1992',
    description: 'L\'arresto di Mario Chiesa, presidente del Pio Albergo Trivulzio, colto in flagrante mentre intascava una tangente, diede il via all\'inchiesta "Mani Pulite". Questo evento scoperchiò il sistema di corruzione dilagante noto come Tangentopoli, che cambiò per sempre il panorama politico italiano.',
    photos: [{ id: 'ph_m10_1', url: 'https://picsum.photos/seed/trivulzio/800/600', caption: 'L\'ingresso del Pio Albergo Trivulzio' }],
    linkedCharacterIds: [],
    tags: ['tangentopoli', 'mani pulite', 'corruzione', 'politica', 'milano'],
  },
  {
    id: 'm11',
    type: 'point',
    creationDate: '2023-11-03T10:30:00Z',
    author: 'Admin',
    coordinates: { latitude: 45.466, longitude: 9.196 },
    periodId: 'anni70',
    categoryIds: ['societa'],
    title: 'San Babila, cuore nero degli anni \'70',
    location: 'Milano',
    eventDate: 'Metà anni \'70',
    description: 'Negli anni \'70, Piazza San Babila divenne il ritrovo della destra giovanile e neofascista, i cosiddetti "sanbabilini". La piazza fu teatro di scontri, violenze e di un omicidio che segnarono profondamente l\'immaginario collettivo di quel periodo.',
    photos: [{ id: 'ph_m11', url: 'https://picsum.photos/seed/sanbabila/800/600', caption: 'Piazza San Babila' }],
    linkedCharacterIds: [],
    tags: ['neofascismo', 'anni di piombo', 'sanbabilini', 'cronaca'],
  }
];

export const paths: Path[] = [
  {
    id: 'path1',
    type: 'path',
    title: 'Corteo funebre di Giuseppe Pinelli',
    description: 'Il percorso del corteo funebre dell\'anarchico Giuseppe Pinelli, morto precipitando da una finestra della questura di Milano nel 1969, dopo la strage di Piazza Fontana.',
    pathCoordinates: [
      { latitude: 45.464204, longitude: 9.189982 }, // Piazza Fontana (partenza simbolica)
      { latitude: 45.465, longitude: 9.188 },
      { latitude: 45.463, longitude: 9.185 },
      { latitude: 45.460, longitude: 9.182 }, // Cimitero Monumentale (arrivo simbolico)
    ],
    creationDate: '2023-11-04T10:00:00Z',
    author: 'HistoryBuff',
    periodId: 'anni60',
    categoryIds: ['storia', 'societa'],
    location: 'Milano',
    eventDate: '20 Dicembre 1969',
    photos: [{id: 'ph_path1', url: 'https://picsum.photos/seed/pinelli_path/800/600', caption: 'Illustrazione del percorso'}],
    linkedCharacterIds: [],
    tags: ['storia', 'milano', 'anni di piombo', 'pinelli'],
  },
];

export const areas: Area[] = [
    {
        id: 'area1',
        type: 'area',
        title: 'Epicentro del primo Sciopero Generale',
        description: 'Nel settembre 1904, Milano fu il cuore del primo sciopero generale nella storia d\'Italia. Proclamato dalla Camera del Lavoro in seguito a eccidi proletari, lo sciopero paralizzò la città e segnò una tappa fondamentale nella storia del movimento operaio italiano.',
        bounds: [
            { latitude: 45.47, longitude: 9.18 },
            { latitude: 45.48, longitude: 9.22 },
            { latitude: 45.45, longitude: 9.21 },
            { latitude: 45.46, longitude: 9.17 }
        ],
        location: 'Milano',
        eventDate: 'Settembre 1904',
        creationDate: '2024-01-15T18:00:00Z',
        author: 'Admin',
        periodId: 'belleepoque',
        categoryIds: ['storia', 'societa'],
        photos: [{id: 'ph_area1', url: 'https://picsum.photos/seed/sciopero1904/800/600', caption: 'Una via di Milano durante lo sciopero'}],
        linkedCharacterIds: [],
        tags: ['sciopero', 'sindacato', 'storia del lavoro', 'milano'],
    },
    {
        id: 'area2',
        type: 'area',
        title: 'Il cuore delle Cinque Giornate di Milano',
        description: 'Tra il 18 e il 22 marzo 1848, le strade del centro di Milano furono teatro di una violenta insurrezione popolare contro il governo austriaco. Le barricate, erette in tutta la città, diventarono il simbolo della lotta per l\'indipendenza che infiammò il Risorgimento.',
        bounds: [
            { latitude: 45.462, longitude: 9.185 },
            { latitude: 45.468, longitude: 9.188 },
            { latitude: 45.465, longitude: 9.195 },
            { latitude: 45.460, longitude: 9.190 }
        ],
        location: 'Centro Storico, Milano',
        eventDate: '18-22 Marzo 1848',
        creationDate: '2024-01-15T19:00:00Z',
        author: 'Admin',
        periodId: 'risorgimento',
        categoryIds: ['storia'],
        photos: [{id: 'ph_area2', url: 'https://picsum.photos/seed/cinquegiornate/800/600', caption: 'Monumento alle Cinque Giornate'}],
        linkedCharacterIds: [],
        tags: ['risorgimento', 'insurrezione', 'milano', 'storia'],
    }
];

export const itineraries: Itinerary[] = [
  {
    id: 'it_m1',
    title: 'Milano: Memorie della Seconda Guerra Mondiale',
    description: 'Un percorso toccante attraverso i luoghi simbolo di Milano che raccontano la Resistenza, la deportazione e la Liberazione.',
    estimatedDuration: '2.5 ore',
    poiIds: ['m4', 'm6', 'm8'],
    author: 'Admin',
    tags: ['storia', 'milano', 'guerra', 'resistenza'],
    coverPhoto: {id: 'ph_it_m1', url: 'https://picsum.photos/seed/resistenza_it/800/600', caption: 'Simbolo della Resistenza'}
  },
  {
    id: 'it_m2',
    title: 'Milano nel Secolo Breve',
    description: 'Dal seme del fascismo agli anni di piombo, fino alla crisi di Tangentopoli: un viaggio nei luoghi che hanno definito il tumultuoso Novecento milanese.',
    estimatedDuration: '4 ore',
    poiIds: ['m3', 'm7', 'm9', 'm10'],
    author: 'Admin',
    tags: ['novecento', 'milano', 'storia politica', 'societa'],
    coverPhoto: {id: 'ph_it_m2', url: 'https://picsum.photos/seed/900_it/800/600', caption: 'Un\'immagine simbolo del \'900 a Milano'}
  },
  {
    id: 'it_m3',
    title: 'Sulle tracce degli Anni di Piombo',
    description: 'Un itinerario che ripercorre alcuni dei luoghi e degli eventi più significativi che hanno segnato Milano durante gli Anni di Piombo, dalla strategia della tensione al terrorismo rosso.',
    estimatedDuration: '3 ore',
    poiIds: ['m1', 'path1', 'm11', 'm9'],
    author: 'HistoryBuff',
    tags: ['storia', 'milano', 'anni di piombo', 'terrorismo'],
    coverPhoto: {id: 'ph_it_m3', url: 'https://picsum.photos/seed/annipiombo_it/800/600', caption: 'Milano, anni \'70'}
  }
];

export const users: User[] = [
  { id: 'user1', name: 'Admin', avatarUrl: 'https://picsum.photos/seed/user_admin/100/100', contributions: 10 },
  { id: 'user2', name: 'HistoryBuff', avatarUrl: 'https://picsum.photos/seed/user_history/100/100', contributions: 8 },
  { id: 'user3', name: 'Cinephile', avatarUrl: 'https://picsum.photos/seed/user_cine/100/100', contributions: 5 },
  { id: 'user4', name: 'ArtExplorer', avatarUrl: 'https://picsum.photos/seed/user_art/100/100', contributions: 3 },
  { id: 'user5', name: 'Urbanist', avatarUrl: 'https://picsum.photos/seed/user_urban/100/100', contributions: 2 },
];
*/
export {};
