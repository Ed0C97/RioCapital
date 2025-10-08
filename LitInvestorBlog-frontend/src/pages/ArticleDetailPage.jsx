// LitInvestorBlog-frontend/src/pages/ArticleDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Disclaimer from '../components/Disclaimer';
import RelatedArticles from '../components/RelatedArticles';
import ShareLinks from '../components/ShareLinks';
import ArticleContacts from '../components/ArticleContacts';
import ArticleActions from '../components/ArticleActions';

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

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: it });
    } catch {
      return '';
    }
  };

  if (loading)
    return (
      <div className="bg-white text-center py-20">Caricamento articolo...</div>
    );
  if (!article)
    return (
      <div className="bg-white text-center py-20">Articolo non trovato.</div>
    );

  return (
    <div className="bg-white">
      <div className="container mx-auto py-12 px-4">
        {}
        {}
        {}
        {}
        <article className="max-w-3xl mx-auto">
          <header className="mb-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {article.category_name}
            </p>
            <p className="text-base text-gray-500 mb-4">
              {formatDate(article.created_at)}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-10">
              {article.title}
            </h1>
            <div className="flex items-center justify-between mb-8">
              <ShareLinks articleTitle={article.title} />
              {article && <ArticleActions article={article} />}
            </div>
            <div className="border-b border-[#d2d2d7]"></div>
          </header>{' '}
          {}
          <div className="article-content">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{

                img: ({ ...props }) => (
                  <figure>
                    <img {...props} />
                    {props.alt && <figcaption>{props.alt}</figcaption>}
                  </figure>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
          <footer className="mt-12">
            <h3 className="text-lg font-semibold text-left mb-4">
              {' '}
              {}
              Condividi articolo
            </h3>
            <div className="mb-8">
              <ShareLinks articleTitle={article.title} />
            </div>
          </footer>
          <Disclaimer variant="gray" />
          {article.show_author_contacts && (
            <ArticleContacts
              name={article.author_name}
              email={article.author_email}
              linkedinUrl={article.author_linkedin_url}
            />
          )}
          <div className="mt-68 is-compact">
            <RelatedArticles
              title="Altro da Lit Investor"
              fetchUrl={`/api/articles?category_id=${article.category_id}&exclude_id=${article.id}&per_page=4`}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
