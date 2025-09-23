// finblog-frontend/src/components/ArticleCarousel.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import ArticleCard from './ArticleCard';

const ArticleCarousel = ({
  articles,
  onLike,
  onFavorite,
  onShare,
  autoPlay = true,
  autoPlayInterval = 5000,
  itemsPerView = 4,
  title = "Articoli Recenti"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [itemsToShow, setItemsToShow] = useState(itemsPerView);
  const intervalRef = useRef(null);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsToShow(1);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2);
      } else if (window.innerWidth < 1280) {
        setItemsToShow(3);
      } else {
        setItemsToShow(itemsPerView);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, [itemsPerView]);

  useEffect(() => {
    if (isPlaying && articles.length > itemsToShow) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const maxIndex = Math.max(0, articles.length - itemsToShow);
          return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
      }, autoPlayInterval);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, articles.length, itemsToShow, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, articles.length - itemsToShow);
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, articles.length - itemsToShow);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const maxIndex = Math.max(0, articles.length - itemsToShow);
  const canNavigate = articles.length > itemsToShow;

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nessun articolo disponibile</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">{title}</h2>
        <div className="flex items-center space-x-2">
          {canNavigate && autoPlay && (
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
              className="flex items-center space-x-1"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span className="hidden sm:inline">Pausa</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">Play</span>
                </>
              )}
            </Button>
          )}
          {canNavigate && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                disabled={!canNavigate}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={!canNavigate}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
            width: `${(articles.length / itemsToShow) * 100}%`
          }}
        >
          {articles.map((article, index) => (
            <div
              key={article.id}
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / articles.length}%` }}
            >
              <ArticleCard
                article={article}
                onLike={onLike}
                onFavorite={onFavorite}
                onShare={onShare}
              />
            </div>
          ))}
        </div>
      </div>

      {}
      {canNavigate && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-primary'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Vai alla slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {}
      {isPlaying && canNavigate && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted-foreground/20">
          <div
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{
              width: `${((currentIndex + 1) / (maxIndex + 1)) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ArticleCarousel;
