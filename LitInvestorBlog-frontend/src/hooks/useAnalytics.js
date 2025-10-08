// RioCapitalBlog-frontend/src/hooks/useAnalytics.js

import { useState, useEffect } from 'react';

export const useAnalytics = (user) => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalArticles: 0,
      totalUsers: 0,
      totalComments: 0,
      totalDonations: 0,
      totalRevenue: 0,
    },
    articles: [],
    users: [],
    comments: [],
    donations: [],
    charts: {
      articlesOverTime: [],
      usersOverTime: [],
      revenueOverTime: [],
      topCategories: [],
      topAuthors: [],
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async (timeRange = '30d') => {
    if (!user || user.role !== 'admin') return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/analytics/dashboard?range=${timeRange}`,
        {
          credentials: 'include',
        },
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        setError('Errore nel caricamento dei dati analytics');
      }
    } catch (error) {
      console.error('Errore analytics:', error);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleAnalytics = async (articleId) => {
    if (!user || user.role !== 'admin') return null;

    try {
      const response = await fetch(`/api/analytics/article/${articleId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Errore analytics articolo:', error);
    }

    return null;
  };

  const fetchUserAnalytics = async (userId) => {
    if (!user || user.role !== 'admin') return null;

    try {
      const response = await fetch(`/api/analytics/user/${userId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Errore analytics utente:', error);
    }

    return null;
  };

  const exportAnalytics = async (type, format = 'csv', timeRange = '30d') => {
    if (!user || user.role !== 'admin') return;

    try {
      const response = await fetch(
        `/api/analytics/export?type=${type}&format=${format}&range=${timeRange}`,
        {
          credentials: 'include',
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${type}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Errore export analytics:', error);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAnalytics();
    }
  }, [user]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    fetchArticleAnalytics,
    fetchUserAnalytics,
    exportAnalytics,
    refetch: () => fetchAnalytics(),
  };
};
