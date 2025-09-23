// RioCapitalBlog-frontend/src/pages/ArticleDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import RelatedArticles from '../components/RelatedArticles';

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/articles/${slug}`);
        if (!response.ok) throw new Error('Articolo non trovato');
        const data = await response.json();
        setArticle(data.article);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchArticle();
  }, [slug]);

  if (loading) return <div className="text-center py-20">Caricamento articolo...</div>;
  if (!article) return <div className="text-center py-20">Articolo non trovato.</div>;

    return (
    <> {}
      <div className="container mx-auto py-12 px-4">
        <article className="max-w-4xl mx-auto">
          {}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">{article.title}</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Pubblicato da {article.author_name} il {new Date(article.created_at).toLocaleDateString('it-IT')}
          </p>
          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-auto max-h-96 object-cover rounded-xl mb-8"
            />
          )}
          <div className="article-content">
              <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
              >
                  {article.content}
              </ReactMarkdown>
          </div>
        </article>
      </div>

      {}
      {}
      {article && (

        <div className="max-w-[980px] mx-auto px-4 py-12">
          <RelatedArticles
            title="Altro da RioCapitalBlog"
            fetchUrl={`/api/articles?category_id=${article.category_id}&exclude_id=${article.id}&per_page=4`}
          />
        </div>
      )}
    </>
  );
};

export default ArticleDetailPage;
