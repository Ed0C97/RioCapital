// src/components/StockTicker.jsx

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

const SCROLL_DURATION_SECONDS = 60;

const StockTicker = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const symbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'INTC',
    'AMD', 'NFLX', 'PYPL', 'SQ', 'CRM', 'BABA', 'DIS'
  ];

  useEffect(() => {
    const fetchMarketData = async () => {
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
        if (!apiKey) {
          throw new Error("Chiave RapidAPI non trovata. Controlla il file .env.local.");
        }

        // --- NUOVA CHIAMATA API PER YAHOO FINANCE ---
        const url = `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/quotes?ticker=${symbols.join(',')}`;
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
          }
        };

        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`Errore API (${response.status})`);
        }

        const data = await response.json();

        // La struttura della risposta è diversa, dobbiamo adattarla
        const formattedData = data.body.map(item => ({
          symbol: item.symbol,
          price: item.regularMarketPrice,
          changesPercentage: item.regularMarketChangePercent
        }));

        if (formattedData.length === 0) {
          throw new Error("L'API ha risposto, ma i dati sono vuoti.");
        }

        setMarketData(formattedData);
      } catch (err) {
        setError(err.message);
        console.error("ERRORE DETTAGLIATO TICKER:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const TickerItem = ({ symbol, price, changesPercentage }) => {
    const isPositive = changesPercentage >= 0;
    const Arrow = () => (
      <svg width="8" height="8" viewBox="0 0 8 8" className="inline-block ml-1">
        <path d={isPositive ? "M4 0L8 8H0L4 0Z" : "M4 8L0 0H8L4 8Z"} fill={isPositive ? '#16a34a' : '#dc2626'} />
      </svg>
    );
    return (
      <div className="flex items-baseline space-x-2 mx-4 text-xs">
        <span className="font-semibold text-gray-800">{symbol}</span>
        <span className="text-gray-700">{price?.toFixed(2)}</span>
        <span className={clsx('font-bold', isPositive ? 'text-green-600' : 'text-red-600')}>
          {changesPercentage?.toFixed(2)}%
          <Arrow />
        </span>
      </div>
    );
  };

  if (loading) {
    return <div className="bg-white h-8 flex items-center justify-center text-xs text-gray-400">Caricamento dati di mercato...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 h-8 flex items-center justify-center text-xs text-red-700 px-4">
        <strong>Errore Ticker:</strong> Dati non disponibili al momento.
      </div>
    );
  }

  if (marketData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 h-8 overflow-hidden relative">
      <div
        className="ticker-content"
        style={{ '--scroll-duration': `${SCROLL_DURATION_SECONDS}s` }}
      >
        {[...marketData, ...marketData].map((item, i) => (
          <TickerItem key={`${item.symbol}-${i}`} symbol={item.symbol} price={item.price} changesPercentage={item.changesPercentage} />
        ))}
      </div>
    </div>
  );
};

export default StockTicker;