// RioCapitalBlog-frontend/src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  PenTool,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Users,
  FileText,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = ({ user }) => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    totalViews: 0,
    totalLikes: 0
  });

  useEffect(() => {
    fetchMyArticles();
    fetchCategories();
    fetchStats();
  }, []);

  const fetchMyArticles = async () => {
    try {
      const response = await fetch('/api/my-articles', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Errore nel caricamento degli articoli:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Errore nel caricamento delle categorie:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {

    setStats({
      totalArticles: 12,
      publishedArticles: 8,
      totalViews: 15420,
      totalLikes: 342
    });
  };

  const handleDeleteArticle = async (articleId) => {
    if (!confirm('Sei sicuro di voler eliminare questo articolo?')) return;

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setArticles(articles.filter(article => article.id !== articleId));
        alert('Articolo eliminato con successo');
      } else {
        alert('Errore durante l\'eliminazione');
      }
    } catch (error) {
      alert('Errore di connessione');
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 RioCapitalBlog-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <p className="text-muted-foreground">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        {}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Autore</h1>
            <p className="text-muted-foreground">
              Benvenuto, {user?.first_name || user?.username}! Gestisci i tuoi articoli e contenuti.
            </p>
          </div>
          <Link to="/admin/new-article">
            <Button className="mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Articolo
            </Button>
          </Link>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Articoli Totali</p>
                  <p className="text-2xl font-bold">{stats.totalArticles}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pubblicati</p>
                  <p className="text-2xl font-bold">{stats.publishedArticles}</p>
                </div>
                <Eye className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Visualizzazioni</p>
                  <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Like Totali</p>
                  <p className="text-2xl font-bold">{stats.totalLikes}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PenTool className="w-5 h-5" />
              <span>I Miei Articoli</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cerca articoli..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {}
            <div className="space-y-4">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nessun articolo trovato</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Prova a modificare i criteri di ricerca.' : 'Inizia creando il tuo primo articolo.'}
                  </p>
                  <Link to="/admin/new-article">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Crea Primo Articolo
                    </Button>
                  </Link>
                </div>
              ) : (
                filteredArticles.map((article) => (
                  <Card key={article.id} className="RioCapitalBlog-card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge
                              className="RioCapitalBlog-category-badge"
                              style={{ backgroundColor: article.category_color || '#007BFF' }}
                            >
                              {article.category_name}
                            </Badge>
                            <Badge variant={article.published ? "default" : "secondary"}>
                              {article.published ? "Pubblicato" : "Bozza"}
                            </Badge>
                          </div>

                          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                            {article.title}
                          </h3>

                          {article.excerpt && (
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                              {article.excerpt}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Creato: {new Date(article.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{article.views_count || 0} visualizzazioni</span>
                            <span>•</span>
                            <span>{article.likes_count || 0} like</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Link to={`/article/${article.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link to={`/admin/edit-article/${article.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
