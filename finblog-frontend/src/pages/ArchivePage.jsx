// src/pages/ArchivePage.jsx

import React, { useState, useEffect } from 'react';
import NewsTile from '../components/NewsTile';
// In futuro, potresti aggiungere qui componenti per filtri o paginazione

const ArchivePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carichiamo tutti gli articoli (o i primi 100, per performance)
    const fetchAllArticles = async () => {
      try {
        const response = await fetch('/api/articles?per_page=100');
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
        }
      } catch (error) {
        console.error("Errore nel caricamento dell'archivio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllArticles();
  }, []);

  if (loading) {
    return <div className="text-center p-12">Caricamento archivio...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12">Archivio</h1>

      {/*
        Usiamo una griglia a 3 colonne su desktop per mostrare più
        articoli, proprio come la pagina Archive di Apple.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map(article => (
          <NewsTile key={article.id} article={article} />
        ))}
      </div>

      {/*
        In futuro, qui potresti aggiungere i controlli per la paginazione
        per caricare più articoli quando l'utente arriva in fondo.
      */}
    </div>
  );
};

export default ArchivePage;