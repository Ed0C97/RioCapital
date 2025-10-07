import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, X } from 'lucide-react';

const ArchiveListItem = ({ article }) => {
  const placeholderImage = 'https://...';
  const formatDate = (dateString) => {
    try { return format(new Date(dateString), 'd MMMM yyyy', { locale: it }); }
    catch { return ''; }
  };

  return (
    <Link to={`/article/${article.slug}`} className="archive-item-link">
      <div className="archive-item">
        <div className="archive-item-image"><img src={article.image_url || placeholderImage} alt={article.title} /></div>
        <div className="archive-item-content">
          <p className="archive-item-category">{article.category_name}</p>
          <h3 className="archive-item-title">{article.title}</h3>
          <p className="archive-item-date">{formatDate(article.created_at)}</p>
        </div>
      </div>
    </Link>
  );
};

const ArchivePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [totalPages, setTotalPages] = useState(1);
  const [filterOptions, setFilterOptions] = useState({ categories: [], authors: [], dates: {} });
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  const clearSearch = (e) => {
    e.preventDefault();
    setSearchParams({});
  };

  const goToPage = (num) => {
    let validPage = Math.min(Math.max(1, num), totalPages);
    setPage(validPage);
    setPageInput(String(validPage));
  };

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      try {
        //const filtersResponse = await fetch('/api/filters/options');
        //if (filtersResponse.ok) setFilterOptions(await filtersResponse.json());

        const params = new URLSearchParams({ per_page: '12', page: String(page) });

        // Aggiungi i filtri esistenti
        if (searchParams.get('category')) params.append('category_slug', searchParams.get('category'));
        if (searchParams.get('author')) params.append('author_id', searchParams.get('author'));
        if (searchParams.get('year')) params.append('year', searchParams.get('year'));
        if (searchParams.get('month')) params.append('month', searchParams.get('month'));

        // Aggiungi il nuovo filtro di ricerca testuale
        if (searchQuery) {
          params.append('q', searchQuery);
        }

        const articlesResponse = await fetch(`/api/articles?${params.toString()}`);
        if (articlesResponse.ok) {
          const data = await articlesResponse.json();
          setArticles(data.articles || []);
          setTotalPages(data.total_pages || 1);
        }
      } catch (error) { console.error("Errore:", error); }
      finally { setLoading(false); }
    };
    fetchPageData();
  }, [searchParams, page, searchQuery]); // <-- Aggiungi searchQuery alle dipendenze

  const handleFilterChange = (filterName, value) => {
    setSearchParams(prevParams => {
      if (value === 'all') prevParams.delete(filterName);
      else prevParams.set(filterName, value);
      prevParams.delete('page');
      setPage(1);
      return prevParams;
    });
  };

  const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

  if (loading) return <div className="text-center p-20">Caricamento...</div>;

  const groupedArticles = articles.reduce((acc, article) => {
    const monthYear = format(new Date(article.created_at), 'MMMM yyyy', { locale: it });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(article);
    return acc;
  }, {});

  return (
    <div className="bg-white w-full">
      <div className="mx-auto px-4 py-12" style={{ maxWidth: '1012px' }}>
        {searchQuery ? (
        <div className="flex items-center gap-4 mb-14">
          <h1 className="text-3xl font-bold">Results for:</h1>
          <span className="inline-flex items-center gap-x-3 px-4 py-2 text-2xl font-bold bg-blue-100 text-blue-800 rounded-full">
            "{searchQuery}"
            <a href="#" onClick={clearSearch} className="text-blue-600 hover:text-blue-900">
              <X className="w-5 h-5" />
            </a>
          </span>
        </div>
      ) : (
        <h1 className="text-4xl font-bold mb-14">Archive</h1>
      )}
        {!searchQuery && (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Select
            value={searchParams.get('category') || 'all'}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger><SelectValue placeholder="Tutte le categorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le categorie</SelectItem>
              {filterOptions.categories.map(cat =>
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              )}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get('author') || 'all'}
            onValueChange={(value) => handleFilterChange('author', value)}
          >
            <SelectTrigger><SelectValue placeholder="Tutti gli autori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli autori</SelectItem>
              {filterOptions.authors.map(author =>
                <SelectItem key={author.value} value={String(author.value)}>{author.label}</SelectItem>
              )}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get('year') || 'all'}
            onValueChange={(value) => handleFilterChange('year', value)}
          >
            <SelectTrigger><SelectValue placeholder="Tutti gli anni" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli anni</SelectItem>
              {Object.keys(filterOptions.dates).sort((a, b) => b - a).map(year =>
                <SelectItem key={year} value={year}>{year}</SelectItem>
              )}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get('month') || 'all'}
            onValueChange={(value) => handleFilterChange('month', value)}
            disabled={!searchParams.get('year')}
          >
            <SelectTrigger><SelectValue placeholder="Tutti i mesi" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i mesi</SelectItem>
              {searchParams.get('year') && filterOptions.dates[searchParams.get('year')]?.map(month =>
                <SelectItem key={month} value={String(month)}>{months[month - 1]}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        )}

        <div className="space-y-12">
          {Object.entries(groupedArticles).map(([monthYear, articlesInGroup]) => (
            <div key={monthYear}>
              <h2 className="text-3xl font-semibold mb-6 capitalize">{monthYear}</h2>
              <div className="archive-list">
                {articlesInGroup.map(article => (
                  <ArchiveListItem key={article.id} article={article} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* --- MODIFICA 2: Questo blocco è stato rimosso perché duplicava gli articoli --- */}
        {/*
        <div className="archive-list">
          {articles.map(article => <ArchiveListItem key={article.id} article={article} />)}
        </div>
        */}

        {/* --- Paginazione Stile Apple --- */}
        <div className="pagination-container">
          <button
            className="pagination-button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            aria-label="Pagina precedente"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
          </button>

          <div className="pagination-status">
            <input
              type="number"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => {
                const num = parseInt(pageInput, 10);
                if (isNaN(num)) {
                  setPageInput(String(page));
                } else {
                  goToPage(num);
                }
              }}
              className="pagination-input"
              min="1"
              max={totalPages}
            />
            <span>di {totalPages}</span>
          </div>

          <button
            className="pagination-button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            aria-label="Pagina successiva"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchivePage;