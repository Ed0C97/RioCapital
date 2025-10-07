// src/components/InteractionBar.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import clsx from 'clsx';

const InteractionBar = ({ article, onUpdate }) => {
  const { user } = useAuth();

  // Stati locali per l'aggiornamento ottimistico
  const [isLiked, setIsLiked] = useState(article.user_has_liked || false);
  const [likeCount, setLikeCount] = useState(article.likes_count || 0);
  const [isFavorited, setIsFavorited] = useState(article.user_has_favorited || false);

  // Sincronizza lo stato se l'articolo di input cambia
  useEffect(() => {
    setIsLiked(article.user_has_liked || false);
    setLikeCount(article.likes_count || 0);
    setIsFavorited(article.user_has_favorited || false);
  }, [article]);

  // src/components/InteractionBar.jsx

    const handleInteraction = async (type) => {
      if (!user) {
        toast.error('Devi effettuare il login per eseguire questa azione.');
        return;
      }

      // --- LOGICA DI AGGIORNAMENTO OTTIMISTICO CORRETTA ---
      if (type === 'like') {
        // Salviamo lo stato attuale PRIMA di qualsiasi modifica
        const originalLikedState = isLiked;
        const originalLikeCount = likeCount;

        // Calcoliamo il nuovo stato e lo applichiamo subito all'UI
        const newLikedState = !originalLikedState;
        const newLikeCount = newLikedState ? originalLikeCount + 1 : originalLikeCount - 1;
        setIsLiked(newLikedState);
        setLikeCount(newLikeCount);

        try {
          const response = await fetch(`/api/articles/${article.id}/like`, {
            method: 'POST',
            credentials: 'include',
          });

          if (!response.ok) throw new Error("Errore dal server");

          const data = await response.json();
          // Sincronizza con la risposta reale del server (che ora è sempre corretta)
          setLikeCount(data.likes_count);
          setIsLiked(data.liked);

        } catch (error) {
          toast.error('Si è verificato un errore. Riprova.');
          // In caso di errore, RIPRISTINA i valori originali
          setIsLiked(originalLikedState);
          setLikeCount(originalLikeCount);
        }

      } else if (type === 'favorite') {
        // La logica per i preferiti è simile
        const originalFavoritedState = isFavorited;
        setIsFavorited(!originalFavoritedState);

        if (!originalFavoritedState) {
          toast.success('Articolo salvato nei preferiti!');
        }

        try {
          const response = await fetch(`/api/articles/${article.id}/favorite`, {
            method: 'POST',
            credentials: 'include',
          });

          if (!response.ok) throw new Error("Errore dal server");

          const data = await response.json();
          // Sincronizza con la risposta reale del server
          setIsFavorited(data.favorited);

        } catch (error) {
          toast.error('Si è verificato un errore. Riprova.');
          // Ripristina in caso di errore
          setIsFavorited(originalFavoritedState);
        }
      }
    };

  return (
    <div className="flex items-center space-x-6 text-sm text-gray-500">
      {/* --- Pulsante Like --- */}
      <button
        onClick={() => handleInteraction('like')}
        className={clsx(
          "flex items-center space-x-1.5 group transition-colors duration-200",
          isLiked ? "text-red-500" : "hover:text-red-500"
        )}
      >
        <Heart
          className={clsx(
            "w-5 h-5 transition-all duration-200",
            isLiked
              ? "fill-current"
              : "group-hover:fill-current fill-transparent stroke-current"
          )}
          strokeWidth={1.5}
        />
        <span className="font-medium">{likeCount}</span>
      </button>

      {/* --- Link Commenti --- */}
      <Link
        to={`/article/${article.slug}#commenti`}
        className="flex items-center space-x-1.5 hover:text-blue-500 transition-colors duration-200 group"
      >
        <MessageCircle
          className="w-5 h-5 transition-all duration-200 group-hover:fill-blue-500/10 fill-transparent stroke-current"
          strokeWidth={1.5}
        />
        <span className="font-medium">{article.comments_count || 0}</span>
      </Link>

      {/* --- Pulsante Preferiti --- */}
      <button
        onClick={() => handleInteraction('favorite')}
        className={clsx(
          "flex items-center space-x-1.5 group transition-colors duration-200",
          isFavorited ? "text-orange-500" : "hover:text-orange-500"
        )}
      >
        <Bookmark
          className={clsx(
            "w-5 h-5 transition-all duration-200",
            isFavorited
              ? "fill-current"
              : "group-hover:fill-current fill-transparent stroke-current"
          )}
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
};

export default InteractionBar;