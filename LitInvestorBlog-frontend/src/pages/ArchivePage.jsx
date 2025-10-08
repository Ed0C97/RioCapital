import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '../components/ui/button';
import { Filter, X, ArrowRight, RotateCcw } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import FadeInOnScroll from '../components/FadeInOnScroll';

// Componente per creare un singolo link di filtro (senza stile a "pillola")
const FilterLink = ({ label, onClick, isActive }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault(); // Impedisce alla pagina di saltare in cima
      onClick(); // Esegue la tua funzione di filtro
    }}
    className={clsx(
      'flex items-center gap-3 text-sm group w-full text-left py-1.5 transition-colors duration-150',
      isActive
        ? 'text-blue-600 font-semibold'
        : 'text-gray-700 hover:text-blue-600',
    )}
  >
    <ArrowRight
      className={clsx(
        'w-4 h-4 transition-all duration-150',
        'group-hover:text-blue-600 group-hover:translate-x-1',
        isActive ? 'text-blue-600' : 'text-gray-400',
      )}
    />
    <span>{label}</span>
  </a>
);

// MODIFICA: Aggiunto 'isLast' per gestire la visibilità del separatore
const ArchiveListItem = ({ article, isLast }) => {
  const placeholderImage =
    'https://images.unsplash.com/photo-1518186225043-963158e70a41?q=80&w=1974&auto=format&fit=crop';
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: it });
    } catch {
      return '';
    }
  };

  return (
    // MODIFICA: Aggiunta classe 'no-divider' se 'isLast' è true
    <Link
      to={`/article/${article.slug}`}
      className={clsx('archive-item-link', { 'no-divider': isLast })}
    >
      <div className="archive-item">
        <div className="archive-item-image">
          <img
            src={article.image_url || placeholderImage}
            alt={article.title}
          />
        </div>
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
  const [pageInput, setPageInput] = useState('1');
  const [totalPages, setTotalPages] = useState(1);
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    authors: [],
    dates: {},
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isFilterContentVisible, setIsFilterContentVisible] = useState(false);

  const clearSearch = (e) => {
    e.preventDefault();
    setSearchParams({});
  };

  const goToPage = (num) => {
    let validPage = Math.min(Math.max(1, num), totalPages);
    setPage(validPage);
    setPageInput(String(validPage));
  };

  const openFilters = () => {
    setIsFilterPanelOpen(true);
    requestAnimationFrame(() => {
      setTimeout(() => setIsFilterContentVisible(true), 50);
    });
  };

  const closeFilters = () => {
    setIsFilterContentVisible(false);
    setTimeout(() => {
      setIsFilterPanelOpen(false);
    }, 300);
  };

  const toggleFilters = () => {
    if (isFilterPanelOpen) {
      closeFilters();
    } else {
      openFilters();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFilterPanelOpen) {
        closeFilters();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFilterPanelOpen]);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      try {
        if (!filterOptions.categories.length) {
          const filtersResponse = await fetch('/api/filters/options');
          if (filtersResponse.ok) {
            const filtersData = await filtersResponse.json();
            setFilterOptions(filtersData);
          } else {
            console.error(
              'Errore nel caricamento dei filtri:',
              filtersResponse.statusText,
            );
          }
        }

        const params = new URLSearchParams({
          per_page: '12',
          page: String(page),
        });
        if (searchParams.get('category'))
          params.append('category_slug', searchParams.get('category'));
        if (searchParams.get('author'))
          params.append('author_id', searchParams.get('author'));
        if (searchParams.get('year'))
          params.append('year', searchParams.get('year'));
        if (searchParams.get('month'))
          params.append('month', searchParams.get('month'));
        if (searchQuery) params.append('q', searchQuery);

        const articlesResponse = await fetch(
          `/api/articles?${params.toString()}`,
        );
        if (articlesResponse.ok) {
          const data = await articlesResponse.json();
          setArticles(data.articles || []);
          setTotalPages(data.total_pages || 1);
        }
      } catch (error) {
        console.error('Errore durante il fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [searchParams, page, searchQuery]);

  const handleFilterChange = (filterName, value) => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      if (value === 'all' || !value) {
        newParams.delete(filterName);
        if (filterName === 'year') {
          newParams.delete('month');
        }
      } else {
        newParams.set(filterName, value);
      }
      newParams.set('page', '1');
      return newParams;
    });
    setPage(1);
    setPageInput('1');
  };

  const clearAllFilters = () => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      newParams.delete('category');
      newParams.delete('author');
      newParams.delete('year');
      newParams.delete('month');
      newParams.set('page', '1');
      return newParams;
    });
    setPage(1);
    setPageInput('1');
  };

  const months = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre',
  ];

  const getActiveFilter = (filterName) => searchParams.get(filterName);

  const getActiveFilterLabels = () => {
    const labels = [];
    const categorySlug = getActiveFilter('category');
    const year = getActiveFilter('year');
    const month = getActiveFilter('month');

    if (categorySlug) {
      const cat = filterOptions.categories.find(
        (c) => c.value === categorySlug,
      );
      if (cat) labels.push(cat.label);
    }
    if (year) {
      labels.push(year);
    }
    if (month && year) {
      labels.push(months[parseInt(month) - 1]);
    }
    return labels;
  };

  const activeLabels = getActiveFilterLabels();
  const activeFiltersCount = activeLabels.length;

  if (loading && !articles.length)
    return <div className="text-center p-20">Caricamento...</div>;

  const groupedArticles = articles.reduce((acc, article) => {
    const monthYear = format(new Date(article.created_at), 'MMMM yyyy', {
      locale: it,
    });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(article);
    return acc;
  }, {});

  const groupKeys = Object.keys(groupedArticles);

  return (
    <div className="bg-white w-full">
      <div className="mx-auto px-4 py-12" style={{ maxWidth: '1012px' }}>
        <FadeInOnScroll>
          {searchQuery ? (
            <div className="flex items-center gap-4 mb-14">
              <h1 className="text-3xl font-bold">Risultati per:</h1>
              <span className="inline-flex items-center gap-x-3 px-4 py-2 text-2xl font-bold bg-blue-100 text-blue-800 rounded-full">
                "{searchQuery}"
                <a
                  href="#"
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <X className="w-5 h-5" />
                </a>
              </span>
            </div>
          ) : (
            <h1 className="text-4xl font-bold mb-14">Archivio</h1>
          )}
        </FadeInOnScroll>

        {!searchQuery && (
          <FadeInOnScroll delay={100}>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Button
                  onClick={toggleFilters}
                  variant="outline"
                  className="flex items-center gap-2 self-start"
                >
                  {isFilterPanelOpen ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Filter className="w-4 h-4" />
                  )}
                  <span>Filtri</span>
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                {activeLabels.map((label, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div
                className={twMerge(
                  'transition-all duration-300 ease-out overflow-hidden',
                  isFilterPanelOpen ? 'h-auto' : 'h-0',
                )}
              >
                <div
                  className={twMerge(
                    'pt-6 pb-8 transition-opacity duration-300 ease-out relative border-t border-gray-200',
                    isFilterContentVisible ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                    {/* Colonne Filtri */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase">
                        Categorie
                      </h3>
                      <ul className="space-y-2">
                        <li>
                          <FilterLink
                            label="Tutte le categorie"
                            onClick={() =>
                              handleFilterChange('category', 'all')
                            }
                            isActive={!getActiveFilter('category')}
                          />
                        </li>
                        {filterOptions.categories?.map((cat) => (
                          <li key={cat.value}>
                            <FilterLink
                              label={cat.label}
                              onClick={() =>
                                handleFilterChange('category', cat.value)
                              }
                              isActive={
                                getActiveFilter('category') === cat.value
                              }
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase">
                        Anno
                      </h3>
                      <ul className="space-y-2">
                        <li>
                          <FilterLink
                            label="Tutti gli anni"
                            onClick={() => handleFilterChange('year', 'all')}
                            isActive={!getActiveFilter('year')}
                          />
                        </li>
                        {Object.keys(filterOptions.dates || {})
                          .sort((a, b) => b - a)
                          .map((year) => (
                            <li key={year}>
                              <FilterLink
                                label={year}
                                onClick={() => handleFilterChange('year', year)}
                                isActive={getActiveFilter('year') === year}
                              />
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase">
                        Mese
                      </h3>
                      {getActiveFilter('year') ? (
                        <ul className="space-y-2">
                          <li>
                            <FilterLink
                              label="Tutti i mesi"
                              onClick={() => handleFilterChange('month', 'all')}
                              isActive={!getActiveFilter('month')}
                            />
                          </li>
                          {filterOptions.dates[getActiveFilter('year')]?.map(
                            (month) => (
                              <li key={month}>
                                <FilterLink
                                  label={months[month - 1]}
                                  onClick={() =>
                                    handleFilterChange('month', String(month))
                                  }
                                  isActive={
                                    getActiveFilter('month') === String(month)
                                  }
                                />
                              </li>
                            ),
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400 italic mt-2 py-1.5">
                          Seleziona prima un anno
                        </p>
                      )}
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <div className="absolute bottom-0 right-0 pb-8">
                      <FilterLink
                        label="Cancella filtri"
                        onClick={clearAllFilters}
                        isActive={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FadeInOnScroll>
        )}

        <div className="space-y-12">
          {groupKeys.map((monthYear) => (
            <FadeInOnScroll key={monthYear} threshold={0.05}>
              <div>
                <h2 className="text-3xl font-semibold mb-6 capitalize">
                  {monthYear}
                </h2>
                <div className="archive-list">
                  {groupedArticles[monthYear].map((article, articleIndex) => {
                    // MODIFICA: Logica per determinare se è l'ultimo elemento
                    const isLastInGroup =
                      articleIndex === groupedArticles[monthYear].length - 1;

                    return (
                      <FadeInOnScroll
                        key={article.id}
                        delay={articleIndex * 80}
                      >
                        {/* MODIFICA: Passa 'isLast' al componente. La riga viene rimossa se è l'ultimo della pagina O se è l'ultimo prima di un nuovo mese. */}
                        <ArchiveListItem
                          article={article}
                          isLast={isLastInGroup}
                        />
                      </FadeInOnScroll>
                    );
                  })}
                </div>
              </div>
            </FadeInOnScroll>
          ))}
        </div>

        <FadeInOnScroll>
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
                  if (isNaN(num)) setPageInput(String(page));
                  else goToPage(num);
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
        </FadeInOnScroll>
      </div>
    </div>
  );
};

export default ArchivePage;
