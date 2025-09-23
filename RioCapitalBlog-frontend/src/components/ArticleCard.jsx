// RioCapitalBlog-frontend/src/components/ArticleCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const ArticleCard = ({
  article,
  onLike,
  onFavorite,
  onShare,
  isLiked = false,
  isFavorited = false,
  showActions = true
}) => {

  const handleLike = (e) => { e.preventDefault(); e.stopPropagation(); onLike?.(article.id); };
  const handleFavorite = (e) => { e.preventDefault(); e.stopPropagation(); onFavorite?.(article.id); };
  const handleShare = (e) => { e.preventDefault(); e.stopPropagation(); onShare?.(article); };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: it });
    } catch { return 'Data non disponibile'; }
  };

  return (
    <Link to={`/articolo/${article.slug}`} className="block h-full group">

      {}
      <div className="
        h-full
        flex flex-col
        bg-white
        rounded-[18px]
        shadow-[2px_4px_12px_rgba(0,0,0,0.08)]
        transition-all duration-300 ease-in-out
        group-hover:shadow-[4px_8px_20px_rgba(0,0,0,0.15)]
        group-hover:-translate-y-1
        overflow-hidden
      ">

        {}
        {article.image_url && (
          <div className="relative h-48 flex-shrink-0">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <Badge
                style={{ backgroundColor: article.category_color || '#007BFF', color: 'white' }}
              >
                {article.category_name}
              </Badge>
            </div>
          </div>
        )}

        {}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-3 flex-grow">
              {article.excerpt}
            </p>
          )}

          {}
          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-auto pt-4">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{article.author_name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.created_at)}</span>
            </div>
          </div>
        </div>

        {}
        {showActions && (
          <div className="px-4 py-3 border-t">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={handleLike} className={`text-xs ${isLiked ? 'text-red-500' : ''}`}>
                  <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {article.likes_count || 0}
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {article.comments?.length || 0}
                </Button>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="sm" onClick={handleFavorite} className={`p-2 ${isFavorited ? 'text-yellow-500' : ''}`}>
                  <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare} className="p-2">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ArticleCard;
