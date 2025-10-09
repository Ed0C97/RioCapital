// src/components/ui/ArticleCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import ArticleActions from '../ArticleActions';
import FadeInOnScroll from '../FadeInOnScroll';
import { cn } from '../../lib/utils';

// Helper per formattare la data (puoi anche metterlo in un file di utils)
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (differenceInDays(new Date(), date) > 7) {
      return format(date, 'd MMMM yyyy', { locale: it });
    }
    return formatDistanceToNow(date, { addSuffix: true, locale: it });
  } catch {
    return '';
  }
};

const isRecent = (dateString) => {
  try {
    return differenceInDays(new Date(), new Date(dateString)) <= 7;
  } catch {
    return false;
  }
};

const isVeryRecent = (dateString) => {
  try {
    const hoursDiff = (new Date() - new Date(dateString)) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  } catch {
    return false;
  }
};

const placeholderImage =
  'https://images.unsplash.com/photo-1518186225043-963158e70a41?q=80&w=1974&auto=format&fit=crop';

const ArticleCard = ({ article, variant = 'standard', className, delay = 0 }) => {
  const CardContent = (
    <>
      <div
        className={cn('overflow-hidden bg-background shrink-0', {
          'md:basis-2/3 md:min-h-[362px]': variant === 'hero',
          'h-[265px]': variant === 'standard',
          'h-[165px]': variant === 'small',
        })}
      >
        <img
          src={article.image_url || placeholderImage}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
      </div>
      <div
        className={cn('p-6 flex flex-col flex-grow', {
          'md:basis-1/3 p-8': variant === 'hero',
          'min-h-[208px]': variant === 'standard',
          'min-h-[100px]': variant === 'small',
        })}
      >
        <div className="flex-grow">
          <div className="flex justify-between items-baseline">
            <p className="text-[0.8rem] font-semibold text-foreground-secondary uppercase mb-2">
              {article.category_name}
            </p>
            {isVeryRecent(article.created_at) && (
              <p className="text-[0.8rem] font-semibold text-blue uppercase tracking-wider bg-blue/10 px-2.5 py-1 rounded-full">
                Novità
              </p>
            )}
          </div>
          <h3
            className={cn('font-semibold leading-tight', {
              'text-[2.2rem]': variant === 'hero',
              'text-2xl': variant === 'standard' || variant === 'small',
            })}
          >
            {article.title}
          </h3>
        </div>
        <div className="flex items-baseline justify-between mt-4">
          <p className="text-[0.9rem] text-foreground-secondary flex items-center gap-2 mt-4">
            {isRecent(article.created_at) && <Clock size={16} />}
            <span>{formatDate(article.created_at)}</span>
          </p>
          <ArticleActions article={article} size="small" />
        </div>
      </div>
    </>
  );

  return (
    <FadeInOnScroll className={className} delay={delay}>
      <Link
        to={`/article/${article.slug}`}
        className={cn(
          'group bg-background-white rounded-[30px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-shadow duration-300 hover:shadow-[0_6px_17px_rgba(0,0,0,0.01)] flex flex-col h-full',
          {
            'md:flex-row': variant === 'hero',
          }
        )}
      >
        {CardContent}
      </Link>
    </FadeInOnScroll>
  );
};

export default ArticleCard;