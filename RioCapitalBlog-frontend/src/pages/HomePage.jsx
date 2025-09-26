// RioCapitalBlog-frontend/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import RelatedArticles from '../components/RelatedArticles';

// --- MODIFICA CHIAVE: Aggiungi questa riga di importazione ---
import Disclaimer from '../components/Disclaimer';

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
    <>
      {/* === Blocco 1: Ultime Notizie (con larghezza limitata) === */}
      <div className="mx-auto px-4 py-12" style={{ maxWidth: '1012px' }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Ultimi Articoli</h1>
        </div>

        {articles.length > 0 ? (
          <div className="news-grid">

            {/* Articolo HERO (Riga 1) */}
            <div className="article-item--1">
              <Link to={`/articolo/${articles[0].slug}`} className="news-card news-card--hero">
                <div className="news-card-media">
                  <img src={articles[0].image_url || placeholderImage} alt={articles[0].title} />
                </div>
                <div className="news-card-content">
                  <div className="flex-grow">
                    <div className="flex justify-between items-baseline">
                      <p className="news-card-category">{articles[0].category_name}</p>
                      {isVeryRecent(articles[0].created_at) && <p className="news-card-eyebrow-new">Novità</p>}
                    </div>
                    <h3 className="news-card-headline">{articles[0].title}</h3>
                  </div>
                  <p className="news-card-timestamp">
                    {isRecent(articles[0].created_at) && <Clock size={16} />}
                    <span>{formatDate(articles[0].created_at)}</span>
                  </p>
                </div>
              </Link>
            </div>

            {/* Articoli MEDI (Riga 2) */}
            {articles[1] && (
              <div className="article-item--2">
                <Link to={`/articolo/${articles[1].slug}`} className="news-card news-card--standard">
                  <div className="news-card-media"><img src={articles[1].image_url || placeholderImage} alt={articles[1].title} /></div>
                  <div className="news-card-content">
                    <div className="flex-grow">
                      <div className="flex justify-between items-baseline"><p className="news-card-category">{articles[1].category_name}</p>{isVeryRecent(articles[1].created_at) && <p className="news-card-eyebrow-new">Novità</p>}</div>
                      <h3 className="news-card-headline">{articles[1].title}</h3>
                    </div>
                    <p className="news-card-timestamp">{isRecent(articles[1].created_at) && <Clock size={16} />}<span>{formatDate(articles[1].created_at)}</span></p>
                  </div>
                </Link>
              </div>
            )}
            {articles[2] && (
              <div className="article-item--3">
                <Link to={`/articolo/${articles[2].slug}`} className="news-card news-card--standard">
                  <div className="news-card-media"><img src={articles[2].image_url || placeholderImage} alt={articles[2].title} /></div>
                  <div className="news-card-content">
                    <div className="flex-grow">
                      <div className="flex justify-between items-baseline"><p className="news-card-category">{articles[2].category_name}</p>{isVeryRecent(articles[2].created_at) && <p className="news-card-eyebrow-new">Novità</p>}</div>
                      <h3 className="news-card-headline">{articles[2].title}</h3>
                    </div>
                    <p className="news-card-timestamp">{isRecent(articles[2].created_at) && <Clock size={16} />}<span>{formatDate(articles[2].created_at)}</span></p>
                  </div>
                </Link>
              </div>
            )}

            {/* Articoli PICCOLI (Riga 3) */}
            {articles.slice(3, 6).map((article, index) => (
            <div className={`article-item--${index + 4}`} key={article.id}>
              <Link to={`/articolo/${article.slug}`} className="news-card news-card--standard news-card--small">
                  <div className="news-card-media"><img src={article.image_url || placeholderImage} alt={article.title} /></div>
                  <div className="news-card-content">
                    <div className="flex-grow">
                      <div className="flex justify-between items-baseline"><p className="news-card-category">{article.category_name}</p>{isVeryRecent(article.created_at) && <p className="news-card-eyebrow-new">Novità</p>}</div>
                      <h3 className="news-card-headline">{article.title}</h3>
                    </div>
                    <p className="news-card-timestamp">{isRecent(article.created_at) && <Clock size={16} />}<span>{formatDate(article.created_at)}</span></p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12"><h3 className="text-xl font-semibold">Nessun articolo da mostrare.</h3></div>
        )}

        <div className="mt-24 mb-4">
          <Disclaimer variant="white" />
        </div>

      </div>

      {/* === Blocco 2: I Più Popolari (con sfondo a larghezza piena) === */}
      <div className="mt-8">
        <RelatedArticles
          title="I più popolari"
          fetchUrl="/api/articles?per_page=4"
        />
      </div>
    </>
  );
};

export default HomePage;