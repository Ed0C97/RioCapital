// RioCapitalBlog-frontend/src/pages/NotFoundPage.jsx

import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Home,
  Search,
  ArrowLeft,
  FileQuestion,
  TrendingUp,
  BookOpen,
  Users,
  Mail
} from 'lucide-react';

const NotFoundPage = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/ricerca?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const popularPages = [
    {
      title: "Home",
      description: "Torna alla pagina principale",
      icon: <Home className="h-5 w-5" />,
      href: "/"
    },
    {
      title: "Articoli Recenti",
      description: "Scopri i nostri ultimi contenuti",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/#articoli-recenti"
    },
    {
      title: "Categorie",
      description: "Esplora per categoria",
      icon: <TrendingUp className="h-5 w-5" />,
      href: "/categorie"
    },
    {
      title: "Chi Siamo",
      description: "Scopri di più su di noi",
      icon: <Users className="h-5 w-5" />,
      href: "/chi-siamo"
    }
  ];

  const helpfulTips = [
    "Controlla l'URL per eventuali errori di battitura",
    "Usa la barra di ricerca per trovare contenuti specifici",
    "Naviga attraverso le nostre categorie principali",
    "Torna alla home page per ricominciare"
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {}
        <div className="text-center mb-12">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
              <FileQuestion className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-3xl font-bold mb-4">Pagina Non Trovata</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ops! La pagina che stai cercando non esiste o è stata spostata.
              Non preoccuparti, ti aiutiamo a trovare quello che cerchi.
            </p>
          </div>

          {}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={() => window.history.back()}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna Indietro
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/'}
              className="flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Vai alla Home
            </Button>
          </div>
        </div>

        {}
        <Card className="mb-12">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Search className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Cerca nel Sito</h3>
              <p className="text-muted-foreground">
                Prova a cercare quello che ti interessa
              </p>
            </div>
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Cerca articoli, categorie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">Pagine Popolari</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularPages.map((page, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => window.location.href = page.href}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    {page.icon}
                  </div>
                  <h4 className="font-semibold mb-2">{page.title}</h4>
                  <p className="text-sm text-muted-foreground">{page.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Suggerimenti Utili</h3>
              <ul className="space-y-3">
                {helpfulTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="text-center">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Hai Bisogno di Aiuto?</h3>
                <p className="text-muted-foreground mb-4">
                  Se non riesci a trovare quello che cerchi, contattaci direttamente.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/contatti'}
                >
                  Contattaci
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="mt-12 text-center">
          <details className="inline-block text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Informazioni tecniche
            </summary>
            <div className="mt-2 p-4 bg-muted rounded-lg text-sm font-mono">
              <p>Error: 404 - Page Not Found</p>
              <p>URL: {window.location.pathname}</p>
              <p>Timestamp: {new Date().toISOString()}</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
