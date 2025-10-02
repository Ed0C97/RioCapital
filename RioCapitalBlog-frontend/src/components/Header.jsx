// RioCapitalBlog-frontend/src/components/Header.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Heart,
  PenTool,
  DollarSign,
  BarChart3,
  MessageSquare,
  FileText,
  BadgeEuro,
  LayoutDashboard
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Importa il tuo logo dalla cartella assets
import RioCapitalLogo from '../assets/litinvestor_logo.webp';
import UserAvatar from '../components/ui/UserAvatar';

const Header = () => {
  const { user, logout, canWriteArticles, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cerca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  return (
    // Usiamo un Fragment <> per contenere entrambe le navbar
    <>
      {/* ================================================================== */}
      {/* 1. NAVBAR SUPERIORE (SCURA) - IL TUO CODICE ORIGINALE MODIFICATO   */}
      {/* ================================================================== */}
      <header className="backdrop-blur-md border-gray-200/50 sticky top-0 z-50" style={{backgroundColor: '#313132'}}>
        <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px]">
          <div className="flex items-center justify-between h-14">

            {/* --- PARTE SINISTRA MODIFICATA --- */}
            <div className="flex items-center gap-10">
              {/* Logo SVG */}
              <Link to="/" className="flex-shrink-0">
                <img src={RioCapitalLogo} alt="Lit Investor Logo" className="h-5 w-auto" />
              </Link>

              {/* Navigazione Desktop (spostata qui) */}
              <nav className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-sm font-normal text-gray-300 hover:text-white transition-colors duration-200 py-2">Home</Link>
                <Link to="/archivio" className="text-sm font-normal text-gray-300 hover:text-white transition-colors duration-200 py-2">Archive</Link>
                <Link to="/chi-siamo" className="text-sm font-normal text-gray-300 hover:text-white transition-colors duration-200 py-2">About me</Link>
                <Link to="/contatti" className="text-sm font-normal text-gray-300 hover:text-white transition-colors duration-200 py-2">Contacts</Link>
              </nav>
            </div>

            {/* --- PARTE DESTRA - IL TUO CODICE ORIGINALE, INVARIATO --- */}
            <div className="flex items-center space-x-10 flex-shrink-0">
                <Link to="/dona" className="hidden md:flex items-center text-gray-300 hover:text-white transition-colors duration-200">
                  <BadgeEuro className="w-4 h-4" />
                </Link>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center text-gray-300 hover:text-white cursor-pointer transition-colors duration-200">
                        <UserAvatar username={user.username} firstName={user.first_name} size={32} />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-lg rounded-lg mt-1">
                      <DropdownMenuItem asChild><Link to="/profilo" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><User className="w-4 h-4" /><span>Profilo</span></Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to="/preferiti" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Heart className="w-4 h-4" /><span>Preferiti</span></Link></DropdownMenuItem>
                      {canWriteArticles() && (
                        <>
                          <DropdownMenuSeparator className="bg-gray-200/50" />
                          <DropdownMenuItem asChild><Link to="/admin/articoli/nuovo" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><PenTool className="w-4 h-4" /><span>Nuovo Articolo</span></Link></DropdownMenuItem>
                        </>
                      )}
                      {isAdmin() && (
                        <>
                          <DropdownMenuItem asChild><Link to="/admin/dashboard" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><LayoutDashboard className="w-4 h-4" /><span>Dashboard</span></Link></DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator className="bg-gray-200/50" />
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><LogOut className="w-4 h-4" /><span>Logout</span></DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link to="/login" className="flex items-center space-x-1 text-sm font-normal text-gray-300 hover:text-white transition-colors duration-200"><User className="w-3.5 h-3.5" /><span className="hidden sm:inline">Sign In / Sign Up</span></Link>
                  </div>
                )}
            </div>

            {/* Mobile Menu Button (invariato) */}
            <Button variant="ghost" size="sm" className="md:hidden text-gray-300 hover:text-white hover:bg-gray-600/50 p-1.5 h-auto transition-colors duration-200" onClick={toggleMenu}>
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-300 hover:text-white hover:bg-gray-600/50 p-1.5 h-auto transition-colors duration-200"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-600/50" style={{backgroundColor: '#313132'}}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Cerca articoli..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-3 py-2 w-full text-sm bg-gray-700/80 border-gray-600 text-white placeholder-gray-400 rounded-md focus:bg-gray-600 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              <Link
                to="/"
                className="block px-3 py-2 text-sm font-normal text-gray-300 hover:text-white hover:bg-gray-600/50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/archivio"
                className="block px-3 py-2 text-sm font-normal text-gray-300 hover:text-white hover:bg-gray-600/50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Archive
              </Link>
              <Link
                to="/chi-siamo"
                className="block px-3 py-2 text-sm font-normal text-gray-300 hover:text-white hover:bg-gray-600/50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                About me
              </Link>
              <Link
                to="/contatti"
                className="block px-3 py-2 text-sm font-normal text-gray-300 hover:text-white hover:bg-gray-600/50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacts
              </Link>
              <Link
                to="/dona"
                className="block px-3 py-2 text-sm font-normal text-gray-300 hover:text-white hover:bg-gray-600/50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <BadgeEuro className="w-4 h-4 inline mr-2" />
                Dona
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ================================================================== */}
      {/* 2. NAVBAR INFERIORE (BIANCA)                                     */}
      {/* ================================================================== */}
      <div className="bg-white border-gray-200">
        <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px]">
          <div className="flex items-center justify-between h-14">

            {/* Titolo a Sinistra */}
            <h2 className="text-xl font-semibold text-gray-800">Lit Investor Blog</h2>

            {/* Contenitore per tutti gli elementi di destra */}
            <div className="hidden md:flex items-center gap-8">
              {/* Navigazione Secondaria */}
              <nav className="flex items-center gap-4">
                <Link to="/categoria/analisi-di-mercato" className="text-sm font-medium text-gray-500 hover:text-gray-900">References</Link>
                <Link to="/categoria/guide" className="text-sm font-medium text-gray-500 hover:text-gray-900">Services</Link>
              </nav>

              {/* Barra di Ricerca */}
              <div className="hidden md:flex items-center">
                <div className="relative flex items-center">
                  {/* Icona lente */}
                  <div
                    onClick={toggleSearch}
                    className="flex items-center cursor-pointer text-gray-500 hover:text-gray-900 transition-colors duration-300"
                  >
                    <Search className="w-4 h-4" />
                  </div>

                  {/* Input a comparsa */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isSearchExpanded ? 'w-64 opacity-100 ml-2' : 'w-0 opacity-0'
                    }`}
                  >
                    <form onSubmit={handleSearch} className="flex items-center">
                      <input
                        type="text"
                        placeholder="Cerca nel blog..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 pl-0 py-1 text-sm bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-0"
                        autoFocus={isSearchExpanded}
                      />
                    </form>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;