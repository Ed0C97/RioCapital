// src/pages/ArchivePage.jsx

import React, { useState, useEffect } from 'react';
import NewsTile from '../components/NewsTile';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';

const ArchivePage = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllArticles = async () => {
      try {
        const response = await fetch('/api/articles?per_page=100');
        if (response.ok) {
          const data = await response.json();
          setAllArticles(data.articles || []);
          setFilteredArticles(data.articles || []);
        }
      } catch (error) {
        console.error("Errore nel caricamento dell'archivio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllArticles();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(allArticles);
    }
  }, [searchTerm, allArticles]);

  if (loading) {
    return <div className="text-center p-20">Caricamento Archivio...</div>;
  }

  return (
    <div className="mx-auto px-4 py-12" style={{ maxWidth: '1080px' }}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Archivio Articoli</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Sfoglia tutti i nostri articoli. Usa la ricerca per trovare argomenti specifici.
        </p>
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Cerca per titolo o categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.map(article => (
          <NewsTile key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default ArchivePage;