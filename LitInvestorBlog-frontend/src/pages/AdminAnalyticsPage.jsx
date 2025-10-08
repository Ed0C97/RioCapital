// LitInvestorBlog-frontend/src/pages/AdminAnalyticsPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../hooks/AuthContext.js';
import { useAnalytics } from '../hooks/useAnalytics';
import RoleGuard from '../components/RoleGuard';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
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
} from 'lucide-react';
import { toast } from 'sonner';

const AdminAnalyticsPage = () => {
  const { user } = useAuth();
  const { analytics, loading, error, fetchAnalytics, exportAnalytics } =
    useAnalytics(user);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics(timeRange);
    setRefreshing(false);
    toast.success('Dati aggiornati');
  };

  const handleExport = async (type, format) => {
    await exportAnalytics(type, format, timeRange);
    toast.success(`Export ${type} completato`);
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Ultimi 7 giorni' },
    { value: '30d', label: 'Ultimi 30 giorni' },
    { value: '90d', label: 'Ultimi 3 mesi' },
    { value: '1y', label: 'Ultimo anno' },
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getGrowthPercentage = (current, previous) => {
    if (!previous) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const overviewStats = [
    {
      title: 'Articoli Totali',
      value: formatNumber(analytics.overview.totalArticles),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      growth: getGrowthPercentage(
        analytics.overview.totalArticles,
        analytics.overview.previousArticles,
      ),
    },
    {
      title: 'Utenti Registrati',
      value: formatNumber(analytics.overview.totalUsers),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      growth: getGrowthPercentage(
        analytics.overview.totalUsers,
        analytics.overview.previousUsers,
      ),
    },
    {
      title: 'Commenti',
      value: formatNumber(analytics.overview.totalComments),
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      growth: getGrowthPercentage(
        analytics.overview.totalComments,
        analytics.overview.previousComments,
      ),
    },
    {
      title: 'Donazioni',
      value: formatCurrency(analytics.overview.totalRevenue),
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      growth: getGrowthPercentage(
        analytics.overview.totalRevenue,
        analytics.overview.previousRevenue,
      ),
    },
  ];

  if (loading && !analytics.overview.totalArticles) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 RioCapitalBlog-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <p className="text-muted-foreground">Caricamento analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Errore nel caricamento</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Riprova
          </Button>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard user={user} requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
              <BarChart3 className="w-8 h-8" />
              <span>Analytics Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Panoramica completa delle performance del blog
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Select
              value={timeRange}
              onValueChange={(value) => {
                setTimeRange(value);
                fetchAnalytics(value);
              }}
            >
              <SelectTrigger className="w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
              />
              Aggiorna
            </Button>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.growth !== '0.0' && (
                      <div
                        className={`flex items-center space-x-1 text-sm ${
                          parseFloat(stat.growth) > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {parseFloat(stat.growth) > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(stat.growth)}%</span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="content">Contenuti</TabsTrigger>
            <TabsTrigger value="users">Utenti</TabsTrigger>
            <TabsTrigger value="revenue">Entrate</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ArticlesOverTimeChart data={analytics.charts.articlesOverTime} />
              <UsersGrowthChart data={analytics.charts.usersOverTime} />
              <EngagementChart data={analytics.charts.engagement} />
              <CategoriesChart data={analytics.charts.topCategories} />
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AuthorsChart data={analytics.charts.topAuthors} />
              <CategoriesChart data={analytics.charts.topCategories} />
            </div>

            {}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Articoli più Popolari</CardTitle>
                  <CardDescription>
                    Articoli con maggior engagement nel periodo selezionato
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('articles', 'csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Esporta
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.articles.slice(0, 10).map((article, index) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium line-clamp-1">
                            {article.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            di {article.author?.username} •{' '}
                            {article.category?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{formatNumber(article.views || 0)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{formatNumber(article.likes || 0)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{formatNumber(article.comments || 0)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share2 className="w-4 h-4" />
                          <span>{formatNumber(article.shares || 0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UsersGrowthChart data={analytics.charts.usersOverTime} />
              <Card>
                <CardHeader>
                  <CardTitle>Utenti più Attivi</CardTitle>
                  <CardDescription>
                    Utenti con maggior engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.users.slice(0, 10).map((user, index) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.role}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.articles_count || 0} articoli •{' '}
                          {user.comments_count || 0} commenti
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart data={analytics.charts.revenueOverTime} />
              <Card>
                <CardHeader>
                  <CardTitle>Riepilogo Donazioni</CardTitle>
                  <CardDescription>
                    Statistiche delle donazioni ricevute
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Totale donazioni:</span>
                      <span className="font-medium">
                        {analytics.overview.totalDonations}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Importo medio:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          analytics.overview.totalRevenue /
                            (analytics.overview.totalDonations || 1),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Donazione più alta:</span>
                      <span className="font-medium">
                        {formatCurrency(analytics.overview.maxDonation || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Esporta Dati</span>
            </CardTitle>
            <CardDescription>
              Scarica i dati analytics in diversi formati
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport('overview', 'csv')}
              >
                Panoramica CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('articles', 'csv')}
              >
                Articoli CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('users', 'csv')}
              >
                Utenti CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('donations', 'csv')}
              >
                Donazioni CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
};

export default AdminAnalyticsPage;
