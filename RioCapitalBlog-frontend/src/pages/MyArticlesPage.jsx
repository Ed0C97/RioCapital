// RioCapitalBlog-frontend/src/pages/MyArticlesPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RoleGuard from '../components/RoleGuard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  FileText,
  TrendingUp,
  Heart,
  MessageSquare,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

const MyArticlesPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, statusFilter, categoryFilter]);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles/my-articles', { // <-- URL MODIFICATO
      credentials: 'include',
      cache: 'no-cache',
      });

      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Errore nel caricamento degli articoli:', error);
      toast.error('Errore nel caricamento degli articoli');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Errore nel caricamento delle categorie:', error);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(article => {
        switch (statusFilter) {
          case 'published':
            return article.published;
          case 'draft':
            return !article.published;
          case 'featured':
            return article.featured;
          default:
            return true;
        }
      });
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(article =>
        article.category?.slug === categoryFilter
      );
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredArticles(filtered);
  };

  const handleDeleteArticle = async (articleId, articleTitle) => {
    if (!confirm(`Sei sicuro di voler eliminare l'articolo "${articleTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setArticles(prev => prev.filter(article => article.id !== articleId));
        toast.success('Articolo eliminato con successo');
      } else {
        toast.error('Errore durante l\'eliminazione dell\'articolo');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione');
    }
  };

  const togglePublishStatus = async (articleId, currentStatus) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/toggle-publish`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (response.ok) {
        setArticles(prev => prev.map(article =>
          article.id === articleId
            ? { ...article, published: !currentStatus }
            : article
        ));
        toast.success(
          currentStatus
            ? 'Articolo rimosso dalla pubblicazione'
            : 'Articolo pubblicato'
        );
      } else {
        toast.error('Errore durante l\'aggiornamento dello stato');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (article) => {
    if (article.featured) {
      return <Badge className="bg-yellow-100 text-yellow-800">In evidenza</Badge>;
    }
    if (article.published) {
      return <Badge className="bg-green-100 text-green-800">Pubblicato</Badge>;
    }
    return <Badge variant="secondary">Bozza</Badge>;
  };

  const getStats = () => {
    const total = articles.length;
    const published = articles.filter(a => a.published).length;
    const drafts = articles.filter(a => !a.published).length;
    const featured = articles.filter(a => a.featured).length;

    return { total, published, drafts, featured };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 RioCapitalBlog-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <p className="text-muted-foreground">Caricamento articoli...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard user={user} requiredRoles={['collaborator', 'admin']}>
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">I Miei Articoli</h1>
            <p className="text-muted-foreground">
              Gestisci i tuoi articoli e crea nuovi contenuti
            </p>
          </div>
          <Link to="/admin/articles/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Articolo
            </Button>
          </Link>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Totale</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pubblicati</p>
                  <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bozze</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.drafts}</p>
                </div>
                <Edit className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In evidenza</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.featured}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Cerca articoli..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="published">Pubblicati</SelectItem>
                  <SelectItem value="draft">Bozze</SelectItem>
                  <SelectItem value="featured">In evidenza</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {}
        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {articles.length === 0
                    ? 'Nessun articolo ancora'
                    : 'Nessun articolo trovato'
                  }
                </h3>
                <p className="text-muted-foreground mb-4">
                  {articles.length === 0
                    ? 'Inizia creando il tuo primo articolo'
                    : 'Prova a modificare i filtri di ricerca'
                  }
                </p>
                {articles.length === 0 && (
                  <Link to="/admin/articles/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Crea il tuo primo articolo
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {}
                    {article.cover_image && (
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={article.cover_image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(article)}
                          {article.category && (
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: article.category.color,
                                color: article.category.color
                              }}
                            >
                              {article.category.name}
                            </Badge>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/articoli/modifica/${article.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifica
                              </Link>
                            </DropdownMenuItem>
                            {article.published && (
                              <DropdownMenuItem asChild>
                                <Link to={`/articolo/${article.slug}`} target="_blank">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Visualizza
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => togglePublishStatus(article.id, article.published)}
                            >
                              {article.published ? (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Rimuovi pubblicazione
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Pubblica
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteArticle(article.id, article.title)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Elimina
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        <Link
                          to={`/admin/articles/edit/${article.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {article.title}
                        </Link>
                      </h3>

                      {article.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(article.created_at)}</span>
                          </div>
                          {article.updated_at !== article.created_at && (
                            <div className="flex items-center space-x-1">
                              <Edit className="w-4 h-4" />
                              <span>Aggiornato {formatDate(article.updated_at)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{article.likes_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{article.comments_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share2 className="w-4 h-4" />
                            <span>{article.shares_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default MyArticlesPage;
