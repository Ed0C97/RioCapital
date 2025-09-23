// finblog-frontend/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import RelatedArticles from '../components/RelatedArticles';

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles?per_page=10');
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
        }
      } catch (error) {
        console.error("Errore nel caricamento delle notizie:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (differenceInDays(new Date(), date) > 7) {
        return format(date, 'd MMMM yyyy', { locale: it });
      }
      return formatDistanceToNow(date, { addSuffix: true, locale: it });
    } catch { return ''; }
  };

  const isRecent = (dateString) => {
    try {
      return differenceInDays(new Date(), new Date(dateString)) <= 7;
    } catch { return false; }
  };

  const isVeryRecent = (dateString) => {
    try {
      const articleDate = new Date(dateString);
      const now = new Date();
      const hoursDiff = (now - articleDate) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    } catch {
      return false;
    }
  };

  const placeholderImage = 'https://images.unsplash.com/photo-1518186225043-963158e70a41?q=80&w=1974&auto=format&fit=crop';

  if (loading) {
    return <div className="text-center p-20">Caricamento...</div>;
  }
  if (articles.length === 0) {
    return <div className="text-center p-20">Nessun articolo da mostrare.</div>;
  }

  const heroArticle = articles[0];
  const secondaryArticles = articles.slice(1);

  return (
    <div className="w-full px-0 py-12" style={{ maxWidth: '980px' }}>
      <div className="mb-12">
        <h1 className="text-4xl font-bold">Ultime notizie</h1>
      </div>

      {}
      <div className="mb-8">
        <Link to={`/articolo/${heroArticle.slug}`} className="news-card news-card--hero">
          <div className="news-card-media">
            <img src={heroArticle.image_url || placeholderImage} alt={heroArticle.title} />
          </div>
          <div className="news-card-content">
            <div className="flex-grow">
              <div className="flex justify-between items-baseline">
                <p className="news-card-category">{heroArticle.category_name}</p>
                {isVeryRecent(heroArticle.created_at) && (
                  <p className="news-card-eyebrow-new">Novità</p>
                )}
              </div>
              <h3 className="news-card-headline">{heroArticle.title}</h3>
            </div>
            <p className="news-card-timestamp">
              {isRecent(heroArticle.created_at) && <Clock size={16} />}
              <span>{formatDate(heroArticle.created_at)}</span>
            </p>
          </div>
        </Link>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
        {secondaryArticles.map(article => (
          <Link to={`/articolo/${article.slug}`} key={article.id} className="news-card news-card--standard">
            <div className="news-card-media">
              <img src={article.image_url || placeholderImage} alt={article.title} />
            </div>
            <div className="news-card-content">
              <div className="flex-grow">
                <div className="flex justify-between items-baseline">
                  <p className="news-card-category">{article.category_name}</p>
                  {isVeryRecent(article.created_at) && (
                    <p className="news-card-eyebrow-new">Novità</p>
                  )}
                </div>
                <h3 className="news-card-headline">{article.title}</h3>
              </div>
              <p className="news-card-timestamp">
                {isRecent(article.created_at) && <Clock size={16} />}
                <span>{formatDate(article.created_at)}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-16">
        <Link to="/archivio">
          <Button size="lg">Sfoglia l'archivio</Button>
        </Link>
      </div>

      <div className="w-full px-0 py-12" style={{ maxWidth: '980px' }}>
        <RelatedArticles
          title="I più popolari"

          fetchUrl="/api/articles?per_page=4"
        />
      </div>
    </div>
  );
};

export default HomePage;
