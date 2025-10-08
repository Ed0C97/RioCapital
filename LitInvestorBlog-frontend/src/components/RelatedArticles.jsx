// src/components/RelatedArticles.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from './ui/button';

const ArticleListItem = ({ article }) => {
  const placeholderImage =
    'https://images.unsplash.com/photo-1518186225043-963158e70a41?q=80&w=1974&auto=format&fit=crop';

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: it });
    } catch {
      return '';
    }
  };

  return (
    <Link to={`/article/${article.slug}`} className="article-list-item">
      <div className="article-list-item-image">
        <img src={article.image_url || placeholderImage} alt={article.title} />
      </div>
      <div className="article-list-item-content">
        <p className="article-list-item-category">{article.category_name}</p>
        <h4 className="article-list-item-title">{article.title}</h4>
        <p className="article-list-item-date">
          {formatDate(article.created_at)}
        </p>
      </div>
    </Link>
  );
};

const RelatedArticles = ({ title, fetchUrl, variant = 'grid' }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const response = await fetch(fetchUrl);
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
        }
      } catch (error) {
        console.error(
          'Errore nel caricamento degli articoli correlati:',
          error,
        );
      } finally {
        setLoading(false);
      }
    };
    if (fetchUrl) loadArticles();
  }, [fetchUrl]);

  if (loading || articles.length === 0) return null;

  // Dividiamo gli articoli in righe da 2 per il desktop
  const firstRow = articles.slice(0, 2);
  const secondRow = articles.slice(2);

  return (
    <section
      className={variant === 'list' ? 'is-compact' : 'related-articles-section'}
    >
      <div className="related-articles-container">
        <h2 className="text-3xl font-bold mb-8">{title}</h2>

        <div className="related-articles-grid">
          {/* PRIMA RIGA */}
          {firstRow.map((article) => (
            <div className="article-list-item-wrapper" key={article.id}>
              <ArticleListItem article={article} />
            </div>
          ))}

          {/* SEPARATORE tra le righe (desktop) o tra gli articoli (mobile) */}
          {secondRow.length > 0 && <div className="row-separator"></div>}

          {/* SECONDA RIGA */}
          {secondRow.map((article) => (
            <div className="article-list-item-wrapper" key={article.id}>
              <ArticleListItem article={article} />
            </div>
          ))}
        </div>

        {variant === 'grid' && (
          <div className="archive-button-container mt-22 flex justify-center">
            <Link to="/archive">
              <Button
                size="lg"
                variant="outline"
                className="btn-outline btn-outline-blue !px-8 !py-3 !text-base"
              >
                Explore the archive
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default RelatedArticles;
