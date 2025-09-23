// finblog-frontend/src/pages/CategoriesPage.jsx

import React, { useState, useEffect, useCallback} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Search,
  TrendingUp,
  DollarSign,
  PieChart,
  Coins,
  CreditCard,
  ArrowRight,
  BookOpen,
  Clock
} from 'lucide-react';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: true,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback((emblaApi) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Errore nel caricamento delle categorie:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('investimenti')) return TrendingUp;
    if (name.includes('mercati')) return PieChart;
    if (name.includes('criptovalute') || name.includes('crypto')) return Coins;
    if (name.includes('economia')) return DollarSign;
    if (name.includes('personale')) return CreditCard;
    return BookOpen;
  };

  const getArticleCountText = (count) => {
    if (count === 0) return 'Nessun articolo';
    if (count === 1) return '1 articolo';
    return `${count} articoli`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 finblog-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <p className="text-muted-foreground">Caricamento categorie...</p>
        </div>
      </div>
    );
  }

  return (

    <div>
      {}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 finblog-text-gradient">Categorie</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Esplora i nostri contenuti organizzati per argomento. Trova facilmente gli articoli che ti interessano di più.
          </p>
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Cerca categorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {}
        </div>
      </div>

      {}
      <div className="embla mb-16">
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {filteredCategories.map((category) => {
              const IconComponent = getCategoryIcon(category.name);
              const isDark = category.name.toLowerCase().includes('pro') || category.name.toLowerCase().includes('ultra');
              const themeClass = isDark ? 'dark-theme' : '';
              const imageUrl = category.image_url || 'URL_SEGNAPOSTO_VALIDO';
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              const isRecent = category.latest_article_date && new Date(category.latest_article_date) > sevenDaysAgo;

              return (
                <div className="embla__slide" key={category.id}>
                  <Link to={`/categoria/${category.slug}`} className="block h-full group">
                    <div className={`apple-promo-card ${themeClass}`}>
                      <img src={imageUrl} alt={category.name} className="apple-promo-card-image" />
                      <div className="apple-promo-card-content">
                        {isRecent && (
                          <p className="apple-promo-card-eyebrow">Novità</p>
                        )}
                        <h3 className="apple-promo-card-title">{category.name}</h3>
                        <p className="apple-promo-card-subtitle">{category.description}</p>
                        <div className="apple-promo-card-footer">
                          <p>{getArticleCountText(category.article_count || 0)}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {}
        <button className="embla__button embla__button--prev" onClick={scrollPrev} disabled={prevBtnDisabled}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
            <path d="M21.559,12.062 L15.618,17.984 L21.5221,23.944 C22.105,24.533 22.1021,25.482 21.5131,26.065 C21.2211,26.355 20.8391,26.4999987 20.4571,26.4999987 C20.0711,26.4999987 19.6851,26.352 19.3921,26.056 L12.4351,19.034 C11.8531,18.446 11.8551,17.4999987 12.4411,16.916 L19.4411,9.938 C20.0261,9.353 20.9781,9.354 21.5621,9.941 C22.1471,10.528 22.1451,11.478 21.5591,12.062 L21.559,12.062 Z"></path>
          </svg>
        </button>
        <button className="embla__button embla__button--next" onClick={scrollNext} disabled={nextBtnDisabled}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
            <path d="M21.559,12.062 L15.618,17.984 L21.5221,23.944 C22.105,24.533 22.1021,25.482 21.5131,26.065 C21.2211,26.355 20.8391,26.4999987 20.4571,26.4999987 C20.0711,26.4999987 19.6851,26.352 19.3921,26.056 L12.4351,19.034 C11.8531,18.446 11.8551,17.4999987 12.4411,16.916 L19.4411,9.938 C20.0261,9.353 20.9781,9.354 21.5621,9.941 C22.1471,10.528 22.1451,11.478 21.5591,12.062 L21.559,12.062 Z"></path>
          </svg>
        </button>
      </div>

      {}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Non trovi quello che cerchi?</CardTitle>
              <CardDescription>Suggerisci nuove categorie o argomenti</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/contatti">
                <Button className="w-full sm:w-auto">
                  Contattaci
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
