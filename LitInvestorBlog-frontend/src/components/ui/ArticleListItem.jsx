// src/components/ui/ArticleListItem.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  articleListItemVariants,
  articleContentVariants,
  imageWrapperVariants,
  imageVariants,
  textContentVariants,
} from './articleListItem.utils';

const placeholderImage =
  'https://images.unsplash.com/photo-1518186225043-963158e70a41?q=80&w=1974&auto=format&fit=crop';

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'd MMMM yyyy', { locale: it });
  } catch {
    return '';
  }
};

const ArticleListItem = ({ article, variant = 'archive', className }) => {
  return (
    <Link
      to={`/article/${article.slug}`}
      className={cn(articleListItemVariants({ variant, className }))}
    >
      <div className={cn(articleContentVariants({ variant }))}>
        <div className={cn(imageWrapperVariants({ variant }))}>
          <img
            src={article.image_url || placeholderImage}
            alt={article.title}
            className={cn(imageVariants({ variant }))}
          />
        </div>
        <div className={cn(textContentVariants({ variant }))}>
          <p className="mb-1 text-xs font-semibold uppercase text-foreground-secondary">
            {article.category_name}
          </p>
          <h3 className="mb-2 text-xl font-semibold leading-tight transition-colors group-hover:text-blue">
            {article.title}
          </h3>
          <p className="text-sm text-foreground-secondary">
            {formatDate(article.created_at)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export { ArticleListItem };
export default ArticleListItem;
