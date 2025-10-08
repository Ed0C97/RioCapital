import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import directLinks from '../data/directLinks.json';

// Mappa per definire i titoli di visualizzazione "canonici" in inglese per ogni pagina
const pageDisplayTitles = {
  '/': 'Home',
  '/archive': 'Archive',
  '/about-us': 'About Us',
  '/contact': 'Contact',
  '/donate': 'Donate',
  '/login': 'Login',
  '/register': 'Register',
  '/profile': 'Profile',
  '/favorites': 'Favorites',
  '/category/market-analysis': 'References',
  '/category/guides': 'Services',
};

// Configurazione per la ricerca "fuzzy" (con errori di battitura)
const fuseOptions = {
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  threshold: 0.4,
  ignoreLocation: true,
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'searchKeywords', weight: 0.7 }, // Campo per le parole chiave delle pagine
    { name: 'category', weight: 0.5 },
    { name: 'content_snippet', weight: 0.2 },
  ],
};

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchIndex, setSearchIndex] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Al primo caricamento, prepara l'indice di ricerca
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        // 1. Raggruppa le parole chiave (italiano/inglese) per ogni pagina
        const pagesBySlug = {};
        for (const [keyword, slug] of Object.entries(directLinks)) {
          if (!pagesBySlug[slug]) {
            pagesBySlug[slug] = {
              type: 'page',
              title: pageDisplayTitles[slug] || slug, // Usa il titolo inglese pulito
              slug: slug,
              searchKeywords: [],
            };
          }
          pagesBySlug[slug].searchKeywords.push(keyword);
        }

        // 2. Converti l'oggetto raggruppato in un array per Fuse.js
        const staticPages = Object.values(pagesBySlug).map((page) => ({
          ...page,
          searchKeywords: page.searchKeywords.join(' '), // Unisce le parole in una stringa ricercabile
        }));

        // 3. Recupera gli articoli dal backend
        const response = await fetch('/api/search-data');
        if (!response.ok) throw new Error('Failed to fetch articles');
        const articles = await response.json();

        // 4. Combina pagine e articoli in un unico indice di ricerca
        setSearchIndex([...staticPages, ...articles]);
      } catch (error) {
        console.error('Failed to fetch search data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchData();
  }, []); // L'array vuoto assicura che venga eseguito solo una volta

  // Crea l'istanza di Fuse, ricalcolata solo se l'indice cambia
  const fuse = useMemo(() => new Fuse(searchIndex, fuseOptions), [searchIndex]);

  // Esegui la ricerca ogni volta che l'utente digita
  useEffect(() => {
    if (searchQuery.length > 1 && !isLoading) {
      const searchResults = fuse.search(searchQuery);
      setResults(searchResults.slice(0, 5)); // Mostra solo i primi 5 risultati
    } else {
      setResults([]);
    }
  }, [searchQuery, fuse, isLoading]);

  return { searchQuery, setSearchQuery, results, isLoading };
};
