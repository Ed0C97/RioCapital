// RioCapitalBlog-frontend/src/components/NewsTile.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';

const NewsTile = ({ article, variant = 'standard' }) => {

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (differenceInDays(new Date(), date) > 7) {
        return format(date, 'd MMMM yyyy', { locale: it });
      }
      return formatDistanceToNow(date, { addSuffix: true, locale: it });
    } catch { return ''; }
  };

  const isRecent = () => {
    try {
      return differenceInDays(new Date(), new Date(article.created_at)) <= 7;
    } catch { return false; }
  };

  const placeholderImage = 'https://images.unsplash.com/photo-1518186225043-963158e70a41?q=80&w=1974&auto=format&fit=crop';

  if (variant === 'hero') {
    return (
      <Link to={`/article/${article.slug}`} className="news-card-link">
        <div className="news-card news-card--hero">
          <div className="news-card-media">
            <img src={article.image_url || placeholderImage} alt={article.title} />
          </div>
          <div className="news-card-content">
            <div>
              <p className="news-card-category">{article.category_name}</p>
              <h3 className="news-card-headline">{article.title}</h3>
            </div>
            <p className="news-card-timestamp">
              {isRecent() && <Clock size={16} />}
              <span>{formatDate(article.created_at)}</span>
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.slug}`} className="news-card-link">
      <div className="news-card news-card--standard">
        <div className="news-card-media">
          <img src={article.image_url || placeholderImage} alt={article.title} />
        </div>
        <div className="news-card-content">
          <div>
            <p className="news-card-category">{article.category_name}</p>
            <h3 className="news-card-headline">{article.title}</h3>
          </div>
          <p className="news-card-timestamp">
            {isRecent() && <Clock size={16} />}
            <span>{formatDate(article.created_at)}</span>
            <span className="mx-2">•</span>
            <span>{article.author_name}</span>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default NewsTile;
