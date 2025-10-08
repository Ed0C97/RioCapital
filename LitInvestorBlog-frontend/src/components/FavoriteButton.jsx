// RioCapitalBlog-frontend/src/components/FavoriteButton.jsx

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/AuthContext.js';

const FavoriteButton = ({
  articleId,
  variant = 'ghost',
  size = 'sm',
  showText = false,
  className = '',
}) => {
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites(user);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    await toggleFavorite(articleId);
    setIsLoading(false);
  };

  const isFav = isFavorite(articleId);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        'transition-all duration-200',
        isFav && 'text-red-500 hover:text-red-600',
        className,
      )}
    >
      <Heart
        className={cn('w-4 h-4', showText && 'mr-2', isFav && 'fill-current')}
      />
      {showText && (
        <span>
          {isLoading
            ? 'Caricamento...'
            : isFav
              ? 'Rimuovi dai preferiti'
              : 'Aggiungi ai preferiti'}
        </span>
      )}
    </Button>
  );
};

export default FavoriteButton;
