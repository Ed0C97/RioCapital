// src/components/GridRelatedArticles.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from './ui/button';

const GridArticleItem = ({ article }) => {
  const placeholderImage = 'https://...';
  const formatDate = (dateString) => {
    try { return format(new Date(dateString), 'd MMMM yyyy', { locale: it }); }
    catch { return ''; }
  };

  return (
    <Link to={`/articolo/${article.slug}`} className="article-list-item">
      <div className="article-list-item-image aspect-square"> {/* Immagine sempre quadrata */}
        <img src={article.image_url || placeholderImage} alt={article.title} />
      </div>
      <div className="article-list-item-content">
        <p className="article-list-item-category">{article.category_name}</p>
        <h4 className="article-list-item-title">{article.title}</h4>
        <p className="article-list-item-date">{formatDate(article.created_at)}</p>
      </div>
    </Link>
  );
};

const GridRelatedArticles = ({ title, fetchUrl }) => {
  const [articles, setArticles] = useState([]);
  // ... (logica di fetch identica agli altri componenti)

  return (
    <section className="related-articles-section">
      <div className="related-articles-container">
        <h2 className="text-4xl font-bold mb-12">{title}</h2>
        <div className="related-articles-grid">
          {articles.map(article => (
            <div className="article-list-item-wrapper" key={article.id}>
              <GridArticleItem article={article} />
            </div>
          ))}
        </div>
        <div className="archive-button-container">
          <Link to="/archivio">
            <Button size="lg" variant="outline">Sfoglia l'archivio</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GridRelatedArticles;