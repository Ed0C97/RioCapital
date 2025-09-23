import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import FavoriteButton from '../components/FavoriteButton';
import ShareButton from '../components/ShareButton';
import { 
  Heart, 
  Calendar, 
  User, 
  Clock, 
  BookOpen,
  Filter,
  Search,
  Grid,
  List
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const FavoritesPage = () => {
  const { user } = useAuth();
  const { favorites, loading } = useFavorites(user);
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_added');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [loadingArticles, setLoadingArticles] = useState(false);

  useEffect(() => {
    if (favorites.length > 0) {
      fetchFavoriteArticles();
    } else {
      setArticles([]);
      setFilteredArticles([]);
    }
  }, [favorites]);

  useEffect(() => {
    filterAndSortArticles();
  }, [articles, searchTerm, sortBy, categoryFilter]);

  const fetchFavoriteArticles = async () => {
    setLoadingArticles(true);
    try {
      const response = await fetch('/api/favorites/articles', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Errore nel caricamento degli articoli preferiti:', error);
    } finally {
      setLoadingArticles(false);
    }
  };

  const filterAndSortArticles = () => {
    let filtered = [...articles];

    // Filtro per ricerca
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro per categoria
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(article => article.category?.slug === categoryFilter);
    }

    // Ordinamento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_added':
          return new Date(b.date_added) - new Date(a.date_added);
        case 'date_published':
          return new Date(b.published_at) - new Date(a.published_at);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return (a.category?.name || '').localeCompare(b.category?.name || '');
        default:
          return 0;
      }
    });

    setFilteredArticles(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getUniqueCategories = () => {
    const categories = articles
      .map(article => article.category)
      .filter(category => category)
      .reduce((unique, category) => {
        if (!unique.find(c => c.id === category.id)) {
          unique.push(category);
        }
        return unique;
      }, []);
    
    return categories;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Accesso Richiesto</h1>
          <p className="text-muted-foreground mb-4">
            Devi essere loggato per visualizzare i tuoi articoli preferiti
          </p>
          <Link to="/login">
            <Button>Accedi</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading || loadingArticles) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 finblog-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <p className="text-muted-foreground">Caricamento preferiti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
          <Heart className="w-8 h-8 text-red-500" />
          <span>I Miei Preferiti</span>
        </h1>
        <p className="text-muted-foreground">
          {articles.length === 0 
            ? 'Non hai ancora salvato nessun articolo nei preferiti'
            : `Hai salvato ${articles.length} articolo${articles.length !== 1 ? 'i' : ''} nei preferiti`
          }
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Nessun articolo preferito</h3>
          <p className="text-muted-foreground mb-4">
            Inizia a salvare gli articoli che ti interessano di più
          </p>
          <Link to="/">
            <Button>
              <BookOpen className="w-4 h-4 mr-2" />
              Esplora Articoli
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Filtri e controlli */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Ricerca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Cerca nei preferiti..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtri */}
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le categorie</SelectItem>
                    {getUniqueCategories().map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Ordina per" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_added">Data aggiunta</SelectItem>
                    <SelectItem value="date_published">Data pubblicazione</SelectItem>
                    <SelectItem value="title">Titolo</SelectItem>
                    <SelectItem value="category">Categoria</SelectItem>
                  </SelectContent>
                </Select>

                {/* Toggle vista */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Risultati filtro */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filteredArticles.length} di {articles.length} articoli
                {searchTerm && ` per "${searchTerm}"`}
              </span>
            </div>
          </div>

          {/* Lista articoli */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">
                Nessun articolo trovato con i filtri selezionati
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredArticles.map((article) => (
                <Card key={article.id} className={`group hover:shadow-lg transition-all duration-300 ${
                  viewMode === 'grid' ? 'hover:-translate-y-1' : ''
                }`}>
                  {viewMode === 'grid' ? (
                    <>
                      {article.cover_image && (
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={article.cover_image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant="secondary"
                            style={{ backgroundColor: article.category?.color + '20', color: article.category?.color }}
                          >
                            {article.category?.name}
                          </Badge>
                          <div className="flex space-x-1">
                            <FavoriteButton articleId={article.id} />
                            <ShareButton articleId={article.id} title={article.title} />
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          <Link to={`/articolo/${article.slug}`}>
                            {article.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {article.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{article.author?.username}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(article.published_at)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {article.cover_image && (
                          <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={article.cover_image}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <Badge 
                              variant="secondary"
                              style={{ backgroundColor: article.category?.color + '20', color: article.category?.color }}
                            >
                              {article.category?.name}
                            </Badge>
                            <div className="flex space-x-1">
                              <FavoriteButton articleId={article.id} />
                              <ShareButton articleId={article.id} title={article.title} />
                            </div>
                          </div>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            <Link to={`/articolo/${article.slug}`}>
                              {article.title}
                            </Link>
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{article.author?.username}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(article.published_at)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 text-xs">
                              <Clock className="w-3 h-3" />
                              <span>Salvato il {formatDate(article.date_added)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoritesPage;
