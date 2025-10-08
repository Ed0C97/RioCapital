// RioCapitalBlog-frontend/src/pages/NotFoundPage.jsx

import React from 'react';
// --- 1. IMPORTA useNavigate E I LINK DIRETTI ---
import { useLocation, Link, useNavigate } from 'react-router-dom';
import directLinks from '../data/directLinks.json';
// ---------------------------------------------
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Home,
  Search,
  ArrowLeft,
  FileQuestion,
  BookOpen,
  Users,
  Mail,
  Heart,
} from 'lucide-react';

const NotFoundPage = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const location = useLocation();
  const navigate = useNavigate(); // --- 2. INIZIALIZZA useNavigate ---

  // --- 3. SOSTITUISCI CON LA FUNZIONE DI RICERCA "INTELLIGENTE" ---
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      if (directLinks[query]) {
        navigate(directLinks[query]); // Navigazione diretta
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); // Ricerca generica
      }
      setSearchQuery('');
    }
  };
  // ----------------------------------------------------------------

  const popularPages = [
    {
      title: 'Home',
      description: 'Return to the main page',
      icon: <Home className="h-5 w-5 text-gray-500" />,
      href: '/',
    },
    {
      title: 'Archive',
      description: 'Discover our latest content',
      icon: <BookOpen className="h-5 w-5 text-gray-500" />,
      href: '/archive',
    },
    {
      title: 'Support Us',
      description: 'Help us keep the blog running',
      icon: <Heart className="h-5 w-5 text-gray-500" />,
      href: '/donate',
    },
    {
      title: 'About Us',
      description: 'Learn more about our mission',
      icon: <Users className="h-5 w-5 text-gray-500" />,
      href: '/about-us',
    },
  ];

  return (
    <div className="bg-white">
      {/* --- HEADER CON SEARCHBAR --- */}
      <div className="w-full mb-16">
        <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pt-12">
          <div className="border-b border-[#d2d2d7] my-2"></div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-regular text-gray-500">
              Page Not Found
            </h2>

            {/* Searchbar */}
            <form onSubmit={handleSearch} className="w-full max-w-xs relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search the site..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 w-full"
              />
            </form>
          </div>
        </div>
      </div>

      {/* --- BLOCCO 404 --- */}
      <div className="max-w-[1012px] mx-auto px-[16px] text-center mb-16">
        <FileQuestion className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h1 className="text-5xl font-semibold text-gray-800 mb-4">Error 404</h1>
        <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-8">
          The page at{' '}
          <strong className="text-[#3b82f6] font-medium">
            {location.pathname}
          </strong>{' '}
          could not be found. Don't worry, you can use the tools below to get
          back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="btn-outline btn-outline-blue !px-8 !py-3 !text-base"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="btn-outline btn-outline-blue !px-8 !py-3 !text-base"
            onClick={() => (window.location.href = '/')}
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>

      {/* --- POPULAR PAGES --- */}
      <div className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-[1012px] mx-auto px-[16px] py-20">
          <h3 className="text-3xl font-semibold text-gray-800 text-center mb-12">
            Popular Pages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularPages.map((page, index) => (
              <Link key={index} to={page.href} className="block group">
                <Card className="h-full hover:border-gray-300 hover:shadow-sm transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 transition-colors group-hover:bg-gray-200">
                      {page.icon}
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {page.title}
                    </h4>
                    <p className="text-sm text-gray-500">{page.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* --- BLOCCO CONTATTI --- */}
      <div className="bg-white">
        <div className="max-w-[1012px] mx-auto px-[16px] py-16 text-center">
          <Mail className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            Still can't find what you're looking for?
          </h3>
          <p className="text-gray-500 mb-6">
            Our team is available to help you.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="btn-outline btn-outline-blue !px-8 !py-3 !text-base"
            onClick={() => (window.location.href = '/')}
          >
            Contact us
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
