// RioCapitalBlog-frontend/src/components/Header.jsx

import React, { useState } from 'react'; // useEffect non è necessario con import statico
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
  Heart,
  PenTool,
  BadgeEuro,
  LayoutDashboard
} from 'lucide-react';

import RioCapitalLogo from '../assets/litinvestor_logo.webp';
import UserAvatar from '../components/ui/UserAvatar';

// --- 1. IMPORTA IL TUO NUOVO FILE JSON ---
import directLinks from '../data/directLinks.json';

const Header = () => {
  const { user, logout, canWriteArticles, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isProfileNavOpen, setIsProfileNavOpen] = useState(false);
  const navigate = useNavigate();

  // --- 2. LA FUNZIONE handleSearch ORA USA IL FILE IMPORTATO ---
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      if (directLinks[query]) {
        navigate(directLinks[query]);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
      setSearchQuery('');
      setIsSearchExpanded(false); // Chiude la barra di ricerca
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchExpanded(!isSearchExpanded);
  const toggleProfileNav = () => setIsProfileNavOpen(!isProfileNavOpen);

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileNavOpen(false);
  };

  return (
    <>
      {/* ... il resto del tuo codice JSX rimane INVARIATO ... */}
      {/* ================================================================== */}
      {/* 1. TOP NAVBAR (DARK)                                             */}
      {/* ================================================================== */}
      <header className="backdrop-blur-md border-gray-200/50 sticky top-0 z-50" style={{backgroundColor: '#313132'}}>
        <div className="max-w-[1012px] mx-auto px-[16px]">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-10">
              <Link to="/" className="flex-shrink-0">
                <img src={RioCapitalLogo} alt="Lit Investor Logo" className="h-7 w-auto" />
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-sm font-normal text-[#f5f5f7] hover:text-white transition-colors whitespace-nowrap">Home</Link>
                <Link to="/archivio" className="text-sm font-normal text-[#f5f5f7] hover:text-white transition-colors whitespace-nowrap">Archive</Link>
                <Link to="/chi-siamo" className="text-sm font-normal text-[#f5f5f7] hover:text-white transition-colors whitespace-nowrap">About Me</Link>
                <Link to="/contatti" className="text-sm font-normal text-[#f5f5f7] hover:text-white transition-colors whitespace-nowrap">Contacts</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-10 flex-shrink-0">
              <Link to="/dona" className="hidden md:flex items-center text-sm font-normal text-[#f5f5f7] hover:text-white transition-colors whitespace-nowrap">
                <BadgeEuro className="w-4 h-4 mr-1" />
                <span>Drop a Tip</span>
              </Link>
              {user ? (
                <div onClick={toggleProfileNav} className="cursor-pointer">
                  <UserAvatar username={user.username} firstName={user.first_name} size={32} />
                </div>
              ) : (
                <Link to="/login" className="flex items-center space-x-1 text-sm font-normal text-[#f5f5f7] hover:text-white transition-colors whitespace-nowrap">
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In / Sign Up</span>
                </Link>
              )}
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="sm" className="text-[#f5f5f7] hover:text-white hover:bg-gray-600/50 p-1.5 h-auto" onClick={toggleMenu}>
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-600/50" style={{backgroundColor: '#313132'}}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <form onSubmit={handleSearch} className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input type="text" placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-full text-sm bg-gray-700/80 border-gray-600 text-white rounded-md" />
                </div>
              </form>
              <Link to="/" className="block px-3 py-2 text-sm rounded-md text-[#f5f5f7] hover:text-white hover:bg-gray-600/50" onClick={closeAllMenus}>Home</Link>
              <Link to="/archivio" className="block px-3 py-2 text-sm rounded-md text-[#f5f5f7] hover:text-white hover:bg-gray-600/50" onClick={closeAllMenus}>Archive</Link>
              <Link to="/chi-siamo" className="block px-3 py-2 text-sm rounded-md text-[#f5f5f7] hover:text-white hover:bg-gray-600/50" onClick={closeAllMenus}>About Me</Link>
              <Link to="/contatti" className="block px-3 py-2 text-sm rounded-md text-[#f5f5f7] hover:text-white hover:bg-gray-600/50" onClick={closeAllMenus}>Contacts</Link>
              <Link to="/dona" className="block px-3 py-2 text-sm rounded-md text-[#f5f5f7] hover:text-white hover:bg-gray-600/50" onClick={closeAllMenus}><BadgeEuro className="w-4 h-4 inline mr-2" />Drop a Tip</Link>
            </div>
          </div>
        )}
      </header>

      {/* ================================================================== */}
      {/* 2. BOTTOM NAVBAR (WHITE) - FIXED                                 */}
      {/* ================================================================== */}
      <div className="bg-white border-gray-200">
        <div className="max-w-[1012px] mx-auto px-[16px] h-14 flex items-center justify-between relative">

          <h2 className="text-xl font-semibold text-gray-800">Lit Investor Blog</h2>

          <div className="relative flex items-center justify-end h-full">

            <div className={`transition-opacity duration-300 ease-in-out ${isProfileNavOpen ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
              <div className="hidden md:flex items-center gap-8">
                <nav className="flex items-center gap-8">
                  {/* SOLUTION: Added whitespace-nowrap */}
                  <Link to="/categoria/analisi-di-mercato" className="text-sm font-medium text-gray-500 hover:text-gray-900 whitespace-nowrap">References</Link>
                  <Link to="/categoria/guide" className="text-sm font-medium text-gray-500 hover:text-gray-900 whitespace-nowrap">Services</Link>
                </nav>
                <div className="relative flex items-center">
                  <div onClick={toggleSearch} className="cursor-pointer text-gray-500 hover:text-gray-900">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${isSearchExpanded ? 'w-64 opacity-100 ml-2' : 'w-0 opacity-0'}`}>
                    <form onSubmit={handleSearch}>
                      <input type="text" placeholder="Search the blog..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-sm bg-transparent focus:outline-none" autoFocus={isSearchExpanded} />
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div className={`absolute top-0 right-0 h-full flex items-center transition-opacity duration-300 ease-in-out ${isProfileNavOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              <nav className="flex items-center gap-8">
                {/* SOLUTION: Added whitespace-nowrap to all links */}
                <Link to="/profilo" onClick={closeAllMenus} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 whitespace-nowrap"><User className="w-4 h-4" />Profile</Link>
                <Link to="/preferiti" onClick={closeAllMenus} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 whitespace-nowrap"><Heart className="w-4 h-4" />Favorites</Link>
                {canWriteArticles() && (
                  <Link to="/admin/articoli/nuovo" onClick={closeAllMenus} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 whitespace-nowrap"><PenTool className="w-4 h-4" />New Article</Link>
                )}
                {isAdmin() && (
                  <Link to="/admin/dashboard" onClick={closeAllMenus} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 whitespace-nowrap"><LayoutDashboard className="w-4 h-4" />Dashboard</Link>
                )}
              </nav>
              <div className="flex items-center gap-8 ml-8">
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 whitespace-nowrap"><LogOut className="w-4 h-4" />Logout</a>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleProfileNav(); }} className="text-gray-500 hover:text-gray-900">
                  <X className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;