// RioCapitalBlog-frontend/src/pages/ArticlesByCategoryPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import ArticleCard from '../components/ArticleCard';

const ArticlesByCategoryPage = () => {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const response = await fetch(`/api/articles?category_slug=${slug}`);
      const data = await response.json();
      setArticles(data.articles);
    };
    fetchArticles();
  }, [slug]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">
        Articoli nella categoria: {slug}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default ArticlesByCategoryPage;
