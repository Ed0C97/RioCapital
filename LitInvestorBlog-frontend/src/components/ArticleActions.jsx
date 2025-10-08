// LitInvestorBlog-frontend/src/components/ArticleActions.jsx

import React, { useState } from 'react';
import { useAuth } from '../hooks/AuthContext.js';
import { Heart, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';

const ArticleActions = ({ article, onUpdate, size = 'default' }) => {
  const { user } = useAuth();

  const [likes, setLikes] = useState(article.likes_count || 0);
  const [hasLiked, setHasLiked] = useState(article.user_has_liked || false);
  const [isLiking, setIsLiking] = useState(false);

  const isSmall = size === 'small';
  const iconSize = isSmall ? 'w-4 h-4' : 'w-5 h-5';

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Devi essere loggato per mettere 'mi piace'.");
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    setHasLiked((prev) => !prev);
    setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(`/api/articles/${article.id}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error("L'operazione non è riuscita.");

      const data = await response.json();
      setLikes(data.likes_count);
      setHasLiked(data.liked);

      if (onUpdate) {
        onUpdate({
          ...article,
          likes_count: data.likes_count,
          user_has_liked: data.liked,
        });
      }
    } catch (error) {
      toast.error(error.message);
      setHasLiked((prev) => !prev);
      setLikes((prev) => (hasLiked ? prev + 1 : prev - 1));
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      className={clsx(
        'flex items-center space-x-4',
        isSmall ? 'text-xs' : 'text-sm',
      )}
    >
      {}
      <div
        onClick={handleLike}
        role="button"
        aria-disabled={isLiking}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleLike(e)}
        className="flex items-center space-x-1.5 group transition-colors duration-200 text-gray-500 cursor-pointer"
      >
        <Heart
          className={clsx(iconSize, 'transition-all duration-200', {
            'text-[#a8192f] fill-[#a8192f] stroke-[#a8192f]': hasLiked,
            'text-[#a8192f] fill-transparent stroke-current group-hover:fill-[#a8192f] group-hover:stroke-[#a8192f]':
              !hasLiked,
          })}
          strokeWidth={1.5}
        />
        <span
          className={clsx('font-medium', {
            'text-[#a8192f]': hasLiked,
            'group-hover:text-[#a8192f]': !hasLiked,
          })}
        >
          {likes}
        </span>
      </div>

      {}
      <div className="flex items-center space-x-1.5 group text-gray-500 hover:text-[#0e549c] transition-colors duration-200">
        <MessageCircle
          className={clsx(
            iconSize,
            'text-[#0e549c] fill-transparent stroke-current group-hover:fill-[#0e549c] group-hover:stroke-[#0e549c] transition-all duration-200',
          )}
          strokeWidth={1.5}
        />
        <span className="font-medium">{article.comments_count || 0}</span>
      </div>
    </div>
  );
};

export default ArticleActions;
