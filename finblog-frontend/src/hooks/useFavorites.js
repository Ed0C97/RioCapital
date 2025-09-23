// finblog-frontend/src/hooks/useFavorites.js

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useFavorites = (user) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei preferiti:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (articleId) => {
    if (!user) {
      toast.error('Devi essere loggato per salvare gli articoli nei preferiti');
      return false;
    }

    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article_id: articleId }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();

        if (data.added) {
          setFavorites(prev => [...prev, { article_id: articleId }]);
          toast.success('Articolo aggiunto ai preferiti');
        } else {
          setFavorites(prev => prev.filter(fav => fav.article_id !== articleId));
          toast.success('Articolo rimosso dai preferiti');
        }

        return data.added;
      } else {
        toast.error('Errore durante l\'operazione');
        return false;
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione');
      return false;
    }
  };

  const isFavorite = (articleId) => {
    return favorites.some(fav => fav.article_id === articleId);
  };

  const getFavoritesCount = () => {
    return favorites.length;
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    getFavoritesCount,
    refetch: fetchFavorites
  };
};
