
import { Point, Category, Period, Character, Itinerary } from '../types';

export const categories: Category[] = [
  { id: 'storia', name: 'Storia & Patrimonio' },
  { id: 'arte', name: 'Arte & Cultura' },
  { id: 'societa', name: 'Cronaca & Società' },
  { id: 'cinema', name: 'Cinema & TV' },
  { id: 'musica', name: 'Musica & Spettacolo' },
];

export const periods: Period[] = [
  { id: 'resistenza', name: 'Resistenza (1943-1945)' },
  { id: 'anni60', name: 'Anni \'60' },
  { id: 'anni70', name: 'Anni di Piombo (\'70)' },
  { id: 'boom', name: 'Boom Economico' },
];

export const characters: Character[] = [
  { id: 'pasolini', name: 'Pier Paolo Pasolini', description: 'Regista, poeta e scrittore', wikipediaUrl: 'https://it.wikipedia.org/wiki/Pier_Paolo_Pasolini' },
  { id: 'fellini', name: 'Federico Fellini', description: 'Regista e sceneggiatore', wikipediaUrl: 'https://it.wikipedia.org/wiki/Federico_Fellini' },
  { id: 'pertini', name: 'Sandro Pertini', description: 'Partigiano e 7º Presidente della Repubblica Italiana', wikipediaUrl: 'https://it.wikipedia.org/wiki/Sandro_Pertini' },
];

export const points: Point[] = [
  {
    id: 'p1',
    creationDate: '2023-10-27T10:00:00Z',
    author: 'Admin',
    coordinates: { latitude: 41.902782, longitude: 12.496366 }, // Roma
    periodId: 'anni60',
    categoryId: 'cinema',
    title: 'La Dolce Vita alla Fontana di Trevi',
    description: 'Nel 1960, Federico Fellini ha girato una delle scene più iconiche della storia del cinema, con Anita Ekberg che fa il bagno nella Fontana di Trevi per il film "La Dolce Vita". Questo momento ha cristallizzato l\'immagine di Roma come capitale del glamour e del cinema internazionale.',
    photos: [{ id: 'ph1', url: 'https://picsum.photos/seed/trevi/800/600', caption: 'Scena del film "La Dolce Vita"' }],
    linkedCharacterIds: ['fellini'],
  },
  {
    id: 'p2',
    creationDate: '2023-10-27T11:00:00Z',
    author: 'Admin',
    coordinates: { latitude: 45.464204, longitude: 9.189982 }, // Milano
    periodId: 'anni70',
    categoryId: 'societa',
    title: 'Strage di Piazza Fontana',
    description: 'Il 12 dicembre 1969, una bomba esplose nella sede della Banca Nazionale dell\'Agricoltura in Piazza Fontana a Milano, causando 17 morti e 88 feriti. Questo evento è considerato l\'inizio della "strategia della tensione" e degli Anni di Piombo in Italia.',
    photos: [{ id: 'ph2', url: 'https://picsum.photos/seed/fontana/800/600', caption: 'Piazza Fontana oggi' }],
    linkedCharacterIds: [],
  },
  {
    id: 'p3',
    creationDate: '2023-10-27T12:00:00Z',
    author: 'Admin',
    coordinates: { latitude: 41.890251, longitude: 12.492373 }, // Roma
    periodId: 'resistenza',
    categoryId: 'storia',
    title: 'L\'eccidio delle Fosse Ardeatine',
    description: 'Il 24 marzo 1944, come rappresaglia per un attentato partigiano in Via Rasella, le truppe di occupazione naziste massacrarono 335 civili e militari italiani presso le Fosse Ardeatine. È uno degli episodi più tragici dell\'occupazione tedesca di Roma.',
    photos: [{ id: 'ph3', url: 'https://picsum.photos/seed/ardeatine/800/600', caption: 'Mausoleo delle Fosse Ardeatine' }],
    linkedCharacterIds: ['pertini'],
  },
  {
    id: 'p4',
    creationDate: '2023-10-28T09:00:00Z',
    author: 'User123',
    coordinates: { latitude: 41.7919, longitude: 12.3331 }, // Ostia
    periodId: 'anni70',
    categoryId: 'arte',
    title: 'L\'omicidio di Pier Paolo Pasolini',
    description: 'Nella notte tra il 1° e il 2 novembre 1975, il poeta e regista Pier Paolo Pasolini fu brutalmente assassinato all\'Idroscalo di Ostia. Le circostanze della sua morte rimangono ancora oggi avvolte nel mistero e oggetto di dibattito.',
    photos: [{ id: 'ph4', url: 'https://picsum.photos/seed/pasolini/800/600', caption: 'Monumento a Pasolini a Ostia' }],
    linkedCharacterIds: ['pasolini'],
  },
];

export const itineraries: Itinerary[] = [
  {
    id: 'it1',
    title: 'Roma: Cinema e Storia del dopoguerra',
    description: 'Un percorso che intreccia i luoghi iconici del cinema neorealista e della Dolce Vita con i siti della memoria storica della Seconda Guerra Mondiale a Roma.',
    estimatedDuration: '3 ore',
    pointIds: ['p1', 'p3'],
  },
  {
    id: 'it2',
    title: 'Milano: Gli Anni di Piombo',
    description: 'Un itinerario per comprendere il clima sociale e politico degli anni \'70 a Milano, partendo da uno dei suoi eventi più tragici.',
    estimatedDuration: '1.5 ore',
    pointIds: ['p2'],
  },
];
