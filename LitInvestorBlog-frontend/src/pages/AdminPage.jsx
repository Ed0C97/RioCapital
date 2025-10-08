// LitInvestorBlog-frontend/src/pages/AdminPage.jsx

import { DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext.js';
import { useAnalytics } from '../hooks/useAnalytics';
import RoleGuard from '../components/RoleGuard';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  ArticlesOverTimeChart,
  UsersGrowthChart,
  RevenueChart,
  CategoriesChart,
  AuthorsChart,
  EngagementChart,
} from '../components/AnalyticsChart';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  BarChart3,
  Users,
  FileText,
  MessageSquare,
  Heart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Calendar,
  Eye,
  Share2,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  ArrowLeft,
  Shield,
  LayoutDashboard,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Data non disponibile';
  try {
    return format(new Date(dateString), 'd MMMM yyyy', { locale: it });
  } catch {
    return 'Data non valida';
  }
};

const OverviewStatCard = ({
  title,
  value,
  icon:   color,
  bgColor,
  growth,
}) => (
  <Card className="shadow-none border-none">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold">{value}</p>
          {growth !== undefined && growth !== 0 && (
            <div
              className={`flex items-center space-x-1 text-sm ${parseFloat(growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {parseFloat(growth) >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(growth)}%</span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ArticleListItem = ({ article, onTogglePublish, onDelete }) => (
  <div className="group border-b last:border-b-0 transition-colors py-8">
    <div className="flex items-center justify-between">
      {}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-4 mb-2.5 flex-wrap">
          <span
            className={`text-xs font-semibold ${article.published ? 'text-blue-600' : 'text-red-600'}`}
          >
            {article.published ? 'PUBLISHED' : 'DRAFT'}
          </span>
          {article.category && (
            <span className="text-sm text-gray-500">
              {article.category.name}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-1">
          {article.title}
        </h3>
        <div className="flex items-center space-x-5 text-sm text-muted-foreground">
          <span className="text-sm">{formatDate(article.created_at)}</span>
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span>{formatNumber(article.likes_count)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-4 h-4" />
            <span>{formatNumber(article.comments_count)}</span>
          </div>
        </div>
      </div>

      {}
      <div className="flex items-center space-x-2 ml-4">
        <Link
          to={`/admin/articoli/modifica/${article.id}`}
          aria-label="Modifica articolo"
          className="hidden sm:inline-flex items-center justify-center h-8 w-8 hover:text-blue-600"
        >
          <Edit className="w-4 h-4" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Link
              aria-label="Altre azioni"
              className="inline-flex items-center justify-center h-8 w-8 hover:text-blue-600"
            >
              <MoreVertical className="w-4 h-4" />
            </Link>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild className="sm:hidden">
              <Link to={`/admin/articoli/modifica/${article.id}`}>
                <Edit className="w-4 h-4 mr-2" /> Modifica
              </Link>
            </DropdownMenuItem>

            {article.published && (
              <DropdownMenuItem asChild>
                <Link
                  to={`/article/${article.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Eye className="w-4 h-4 mr-2" /> Visualizza
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => onTogglePublish(article.id, article.published)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {article.published ? 'Rendi bozza' : 'Pubblica'}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => onDelete(article.id, article.title)}
              className="text-red-600 focus:text-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Elimina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
);

const ArticleList = ({
  articles,
  categories,
  onTogglePublish,
  onDelete,
  page,
  totalPages,
  goToPage,
  pageInput,
  setPageInput,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredArticles = useMemo(() => {
    return articles
      .filter((article) => {
        const searchMatch = searchTerm
          ? article.title.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        const statusMatch =
          statusFilter === 'all' ||
          (statusFilter === 'published' && article.published) ||
          (statusFilter === 'draft' && !article.published);
        const categoryMatch =
          categoryFilter === 'all' || article.category?.slug === categoryFilter;
        return searchMatch && statusMatch && categoryMatch;
      })
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : 0;
        const dateB = b.created_at ? new Date(b.created_at) : 0;
        return dateB - dateA;
      });
  }, [articles, searchTerm, statusFilter, categoryFilter]);

  const groupedArticles = useMemo(() => {
    return filteredArticles.reduce((acc, article) => {
      try {
        const monthYear = format(new Date(article.created_at), 'MMMM yyyy', {
          locale: it,
        });
        if (!acc[monthYear]) {
          acc[monthYear] = [];
        }
        acc[monthYear].push(article);
      } catch {
        console.warn(
          `Data non valida per l'articolo ID ${article.id}:`,
          article.created_at,
        );
        if (!acc['Senza data']) {
          acc['Senza data'] = [];
        }
        acc['Senza data'].push(article);
      }
      return acc;
    }, {});
  }, [filteredArticles]);

  return (
    <Card className="shadow-none border-none bg-transparent">
      <CardContent className="px-0">
        <div className="flex flex-col md:flex-row gap-6 mb-8 p-0 trasparent">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cerca per titolo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="published">Pubblicati</SelectItem>
              <SelectItem value="draft">Bozze</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le categorie</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-12">
          {filteredArticles.length > 0 ? (
            Object.entries(groupedArticles).map(
              ([monthYear, articlesInGroup]) => (
                <div key={monthYear}>
                  <h2 className="text-2xl font-semibold mb-6 capitalize text-gray-800">
                    {monthYear}
                  </h2>
                  <div className="bg-white border border-gray-200 shadow-none border-none overflow-hidden">
                    {articlesInGroup.map((article) => (
                      <ArticleListItem
                        key={article.id}
                        article={article}
                        onTogglePublish={onTogglePublish}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                </div>
              ),
            )
          ) : (
            <div className="text-center py-16 bg-white border rounded-lg">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Nessun articolo trovato</h3>
              <p className="text-muted-foreground mt-2">
                Prova a modificare i filtri o a creare un nuovo articolo.
              </p>
            </div>
          )}
        </div>
        {totalPages > 1 && (
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
        )}
      </CardContent>
    </Card>
  );
};

const SlidingTabsNav = ({ activeTab, onTabChange, tabs }) => {
  const getActiveIndex = () => tabs.findIndex((tab) => tab.value === activeTab);

  return (
    <div className="relative border bg-[#ffffff] p-1 rounded-full h-12 grid grid-cols-5">
      {}
      <div
        className="absolute top-1 bottom-1 bg-[#0071e3] rounded-full shadow-none border-none transition-all duration-300 ease-in-out"
        style={{
          left: `calc(${getActiveIndex() * 20}% + 4px)`,
          width: 'calc(20% - 8px)',
        }}
      />

      {}
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <span
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`relative z-10 cursor-pointer transition-all duration-300 ease-in-out font-medium flex items-center justify-center text-sm md:text-base ${
              activeTab === tab.value
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {tab.label}
          </span>
        );
      })}
    </div>
  );
};

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    fetchAnalytics,
    exportAnalytics,
  } = useAnalytics(user);

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageInput, setPageInput] = useState('1');

  const tabs = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard },
    { value: 'articles', label: 'Articols', icon: FileText },
    { value: 'analytics', label: 'Analytics', icon: TrendingUp },
    { value: 'donations', label: 'Donations', icon: DollarSign },
    { value: 'moderazione', label: 'Moderation', icon: Shield },
  ];

  const goToPage = (num) => {

    const newPage = Math.max(1, Math.min(num, totalPages));
    setPage(newPage);
    setPageInput(String(newPage));
  };

  useEffect(() => {
    const fetchData = async () => {
      setArticlesLoading(true);
      try {

        const articlesRes = await fetch(
          `/api/articles/my-articles?page=${page}`,
          { credentials: 'include' },
        );

        if (articlesRes.ok) {
          const data = await articlesRes.json();
          setArticles(data.articles || []);

          setTotalPages(data.pages || 1);
        } else {
          console.error(
            'Errore API articoli:',
            articlesRes.status,
            await articlesRes.text(),
          );
          toast.error(
            `Errore nel caricamento degli articoli (status: ${articlesRes.status}).`,
          );
        }

        const categoriesRes = await fetch('/api/categories');
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        } else {
          toast.error('Errore nel caricamento delle categorie.');
        }
      } catch (error) {
        console.error('Errore di connessione nel caricamento dati:', error);
        toast.error('Errore di connessione durante il caricamento dei dati.');
      } finally {
        setArticlesLoading(false);
      }
    };
    if (user) {
      fetchData();
    } else {
      setArticlesLoading(false);
    }

  }, [user, page]);

  const handleTogglePublish = async (articleId, currentStatus) => {
    try {
      const response = await fetch(
        `/api/articles/${articleId}/toggle-publish`,
        {
          method: 'PATCH',
          credentials: 'include',
        },
      );
      if (response.ok) {
        setArticles((prev) =>
          prev.map((a) =>
            a.id === articleId ? { ...a, published: !currentStatus } : a,
          ),
        );
        toast.success(
          `Articolo ${currentStatus ? 'impostato come bozza' : 'pubblicato'}.`,
        );
      } else {
        toast.error("Errore nell'aggiornamento dello stato di pubblicazione.");
      }
    } catch (error) {
      console.error("Toggle publish failed:", error);
      toast.error('Errore di connessione.');
    }
  };

  const handleDeleteArticle = async (articleId, articleTitle) => {
    if (
      !confirm(
        `Sei sicuro di voler eliminare l'articolo "${articleTitle}"? L'azione è irreversibile.`,
      )
    )
      return;
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
        toast.success('Articolo eliminato con successo.');
      } else {
        toast.error("Errore durante l'eliminazione dell'articolo.");
      }
    } catch (error) {
      console.error("Delete article failed:", error);
      toast.error('Errore di connessione.');
    }
  };

  const handleRefreshAnalytics = async () => {
    setRefreshing(true);
    await fetchAnalytics(timeRange);
    setRefreshing(false);
    toast.success('Dati analytics aggiornati.');
  };

  const handleExport = async (type) => {
    try {
      await exportAnalytics(type, 'csv', timeRange);
      toast.success(`Export ${type} avviato.`);
    } catch (error) {
      console.error(`Export ${type} failed:`, error);
      toast.error(`Errore durante l'export ${type}.`);
    }
  };

  const getGrowthPercentage = (current, previous) => {
    if (previous === null || previous === undefined || previous === 0) return 0;
    if (current === null || current === undefined) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const overviewStats = useMemo(
    () => [
      {
        title: 'Articoli',
        value: formatNumber(analytics.overview?.totalArticles),
        icon: FileText,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        growth: getGrowthPercentage(
          analytics.overview?.totalArticles,
          analytics.overview?.previousArticles,
        ),
      },
      {
        title: 'Utenti',
        value: formatNumber(analytics.overview?.totalUsers),
        icon: Users,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        growth: getGrowthPercentage(
          analytics.overview?.totalUsers,
          analytics.overview?.previousUsers,
        ),
      },
      {
        title: 'Commenti',
        value: formatNumber(analytics.overview?.totalComments),
        icon: MessageSquare,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        growth: getGrowthPercentage(
          analytics.overview?.totalComments,
          analytics.overview?.previousComments,
        ),
      },
      {
        title: 'Donazioni',
        value: formatCurrency(analytics.overview?.totalRevenue),
        icon: DollarSign,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        growth: getGrowthPercentage(
          analytics.overview?.totalRevenue,
          analytics.overview?.previousRevenue,
        ),
      },
    ],
    [analytics.overview],
  );

  if (analyticsLoading || articlesLoading) {
    return (
      <div className="bg-[#ffffff] min-h-screen">
        <div className="text-center py-20">Caricamento dashboard...</div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="bg-[#ffffff] min-h-screen">
        <div className="text-center py-20 text-red-600">
          <h3>Errore nel caricamento dei dati di Analytics</h3>
          <p>{analyticsError.message || 'Si è verificato un errore sconosciuto.'}</p>
          <Button onClick={handleRefreshAnalytics} className="mt-4">
            Riprova
          </Button>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard user={user} requiredRoles={['collaborator', 'admin']}>
      <div className="bg-[#ffffff] min-h-screen">
        {}
        <div className="w-full mb-12">
          <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pt-12">
            {}
            <div className="mb-8">
              <div className="border-b border-[#d2d2d7] my-2"></div>
              <h2 className="text-2xl font-regular text-gray-500">
                Admin Dashboard
              </h2>
            </div>

            {}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome,{' '}
                  {user?.first_name || user?.last_name
                    ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
                    : user?.username}
                </h1>
                {}
                <p className="text-muted-foreground">
                  {tabs.find((tab) => tab.value === activeTab)?.label ||
                    'Panoramica e gestione del blog.'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigate('/admin/articoli/nuovo')}
                  className="btn-outline btn-outline-blue"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Articolo
                </Button>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pb-16">
          <div className="space-y-8">
            {}
            <SlidingTabsNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={tabs}
            />

            {}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {overviewStats.map((stat, i) => (
                    <OverviewStatCard key={i} {...stat} />
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-none border-none">
                    <CardHeader>
                      <CardTitle className="text-xl">
                        Articoli nel Tempo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ArticlesOverTimeChart
                        data={analytics.charts?.articlesOverTime}
                      />
                    </CardContent>
                  </Card>
                  <Card className="shadow-none border-none">
                    <CardHeader>
                      <CardTitle className="text-xl">Crescita Utenti</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UsersGrowthChart
                        data={analytics.charts?.usersOverTime}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {}
            {activeTab === 'articles' && (
              <ArticleList
                articles={articles}
                categories={categories}
                onTogglePublish={handleTogglePublish}
                onDelete={handleDeleteArticle}

                page={page}
                totalPages={totalPages}
                goToPage={goToPage}
                pageInput={pageInput}
                setPageInput={setPageInput}
              />
            )}

            {}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <Card className="shadow-none border-none">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <CardTitle className="text-2xl">
                        Dettagli Analytics
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={timeRange}
                          onValueChange={(v) => {
                            setTimeRange(v);
                            fetchAnalytics(v);
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7d">Ultimi 7 giorni</SelectItem>
                            <SelectItem value="30d">
                              Ultimi 30 giorni
                            </SelectItem>
                            <SelectItem value="90d">Ultimi 3 mesi</SelectItem>
                            <SelectItem value="1y">Ultimo anno</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleRefreshAnalytics}
                          disabled={refreshing}
                          variant="outline"
                          size="icon"
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                          />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="btn-outline btn-outline-gray"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleExport('overview')}
                            >
                              Panoramica
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExport('articles')}
                            >
                              Articoli
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExport('users')}
                            >
                              Utenti
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExport('engagement')}
                            >
                              Engagement
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="shadow-none border-none">
                        <CardHeader>
                          <CardTitle className="text-lg">Ricavi</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RevenueChart
                            data={analytics.charts?.revenueOverTime}
                          />
                        </CardContent>
                      </Card>
                      <Card className="shadow-none border-none">
                        <CardHeader>
                          <CardTitle className="text-lg">Categorie</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CategoriesChart
                            data={analytics.charts?.categoriesDistribution}
                          />
                        </CardContent>
                      </Card>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="shadow-none border-none">
                        <CardHeader>
                          <CardTitle className="text-lg">Autori</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <AuthorsChart
                            data={analytics.charts?.authorsPerformance}
                          />
                        </CardContent>
                      </Card>
                      <Card className="shadow-none border-none">
                        <CardHeader>
                          <CardTitle className="text-lg">Engagement</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <EngagementChart
                            data={analytics.charts?.engagementMetrics}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {}
            {activeTab === 'donations' && (
              <div className="text-center py-20 bg-white border rounded-lg">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Sezione Donazioni</h3>
                <p className="text-muted-foreground mt-2">
                  Questa sezione è in costruzione.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminPage;
