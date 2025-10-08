// LitInvestorBlog-frontend/src/components/Header.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext.js';
import { Button } from './ui/button';
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  Heart,
  PenTool,
  BadgeEuro,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';
import RioCapitalLogo from '../assets/litinvestor_logo.webp';
import UserAvatar from '../components/ui/UserAvatar';
import { useSearch } from '../hooks/useSearch';
import SearchResultsDropdown from './SearchResultsDropdown';
import directLinks from '../data/directLinks.json';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Header = () => {

  const { user, logout, canWriteArticles, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileNavOpen, setIsProfileNavOpen] = useState(false);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  const { searchQuery, setSearchQuery, results } = useSearch();
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  const openSearch = () => {
    if (isProfileNavOpen) setIsProfileNavOpen(false);
    setIsSearchVisible(true);
    requestAnimationFrame(() => {
      setIsSearchExpanded(true);
      searchInputRef.current?.focus();
      setTimeout(() => setIsContentVisible(true), 150);
    });
  };

  const closeSearch = () => {
    setIsContentVisible(false);
    setTimeout(() => {
      setIsSearchExpanded(false);
      setTimeout(() => {
        setIsSearchVisible(false);
        setSearchQuery('');
      }, 300);
    }, 50);
  };

  const toggleSearch = () => {
    if (isSearchVisible) {
      closeSearch();
    } else {
      openSearch();
    }
  };

  const toggleProfileNav = () => {
    if (isSearchVisible) closeSearch();
    setIsProfileNavOpen((prev) => !prev);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileNavOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isSearchVisible) closeSearch();
        if (isProfileNavOpen) setIsProfileNavOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchVisible, isProfileNavOpen]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      if (directLinks[query]) navigate(directLinks[query]);
      else if (results.length > 0 && results[0].score < 0.1)
        navigate(results[0].item.slug);
      else navigate(`/search?q=${encodeURIComponent(query)}`);
      closeSearch();
    }
  };

  const handleResultClick = () => closeSearch();
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) navigate('/');
  };
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const showSearchResults =
    isSearchVisible && searchQuery.trim().length > 0 && results.length > 0;
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Archive', path: '/archive' },
    { name: 'About me', path: '/about-us' },
    { name: 'Contacts', path: '/contact' },
    { name: 'Drop a tip', path: '/donate' },
  ];

  return (
    <>
      {isSearchVisible && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 opacity-100"
          onClick={closeSearch}
        ></div>
      )}

      <header className="sticky top-0 z-40">
        {}
        <div className="bg-[#313132]">
          <div className="max-w-[1012px] mx-auto px-[16px] h-14 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Link to="/" className="flex-shrink-0">
                <img
                  src={RioCapitalLogo}
                  alt="Lit Investor Logo"
                  className="h-7 w-auto"
                />
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link
                  to="/"
                  className="text-sm font-normal text-[#f5f5f7] hover:text-white"
                >
                  Home
                </Link>
                <Link
                  to="/archive"
                  className="text-sm font-normal text-[#f5f5f7] hover:text-white"
                >
                  Archive
                </Link>
                <Link
                  to="/about-us"
                  className="text-sm font-normal text-[#f5f5f7] hover:text-white"
                >
                  About Me
                </Link>
                <Link
                  to="/contact"
                  className="text-sm font-normal text-[#f5f5f7] hover:text-white"
                >
                  Contacts
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-10 flex-shrink-0">
              <Link
                to="/donate"
                className="hidden md:flex items-center text-sm font-normal text-[#f5f5f7] hover:text-white"
              >
                <BadgeEuro className="w-4 h-4 mr-1" />
                <span>Drop a Tip</span>
              </Link>
              {user ? (
                <div onClick={toggleProfileNav} className="cursor-pointer">
                  <UserAvatar
                    username={user.username}
                    firstName={user.first_name}
                    size={32}
                  />
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-sm font-normal text-[#f5f5f7] hover:text-white"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In / Sign Up</span>
                </Link>
              )}
            </div>
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#f5f5f7] hover:text-white hover:bg-gray-600/50 p-1.5 h-auto"
                onClick={toggleMenu}
              >
                {isMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {}
        <div
          className={twMerge(
            'bg-white transition-all duration-300 ease-out relative',
            isSearchExpanded ? 'h-[400px]' : 'h-14',
          )}
        >
          <div className="max-w-[1012px] mx-auto px-[16px] h-full flex flex-col">
            <div className="h-14 flex items-center justify-between flex-shrink-0 relative">
              <h2
                className={twMerge(
                  'text-xl font-semibold text-gray-800 transition-opacity duration-200',
                  (isSearchVisible || isProfileNavOpen) && 'opacity-0',
                )}
              >
                Lit Investor Blog
              </h2>

              {}
              <div
                className={twMerge(
                  'hidden md:flex items-center gap-8 absolute top-0 right-0 h-full transition-opacity duration-300',
                  isProfileNavOpen && 'opacity-0 pointer-events-none',
                )}
              >
                <nav
                  className={twMerge(
                    'flex items-center gap-8 transition-opacity duration-200',
                    isSearchVisible && 'opacity-0',
                  )}
                >
                  <Link
                    to="/category/market-analysis"
                    className="text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    References
                  </Link>
                  <Link
                    to="/category/guides"
                    className="text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Services
                  </Link>
                </nav>
                <div
                  onClick={toggleSearch}
                  className="cursor-pointer text-gray-500 hover:text-gray-900 p-2"
                >
                  {isSearchVisible ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </div>
              </div>

              {}
              <div
                className={twMerge(
                  'hidden md:flex items-center gap-8 absolute top-0 right-0 h-full transition-opacity duration-300',
                  !isProfileNavOpen && 'opacity-0 pointer-events-none',
                )}
              >
                <nav className="flex items-center gap-8">
                  <Link
                    to="/profile"
                    onClick={closeAllMenus}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={closeAllMenus}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    <Heart className="w-4 h-4" />
                    Favorites
                  </Link>
                  {canWriteArticles() && (
                    <Link
                      to="/admin/articoli/nuovo"
                      onClick={closeAllMenus}
                      className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      <PenTool className="w-4 h-4" />
                      New Article
                    </Link>
                  )}
                  {isAdmin() && (
                    <Link
                      to="/admin/dashboard"
                      onClick={closeAllMenus}
                      className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  )}
                </nav>
                <div className="flex items-center gap-8 ml-8">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleProfileNav();
                    }}
                    className="text-gray-500 hover:text-gray-900"
                  >
                    <X className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {}
            <div
              className={twMerge(
                'transition-opacity duration-300 ease-out pt-4 pb-8',
                isContentVisible ? 'opacity-100' : 'opacity-0',
                !isSearchVisible && 'hidden',
              )}
            >
              {}
              <form
                onSubmit={handleFormSubmit}
                className="relative flex items-center gap-4 mb-12"
              >
                <Search className="w-6 h-6 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search the Lit Investor blog"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xl font-semibold bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
                />
              </form>
              <div
                className={clsx(
                  'transition-all duration-300 ease-out',
                  isContentVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4',
                )}
              >
                {showSearchResults ? (
                  <SearchResultsDropdown
                    results={results}
                    onResultClick={handleResultClick}
                    isExpandedView={true}
                  />
                ) : (
                  <div>
                    <h3 className="text-xs font-regular text-gray-500 mb-3">
                      Quick links
                    </h3>
                    <ul className="space-y-3">
                      {quickLinks.map((link, index) => (
                        <li
                          key={link.name}
                          style={{ transitionDelay: `${index * 50}ms` }}
                          className={clsx(
                            'transition-all duration-300 ease-out',
                            isContentVisible
                              ? 'opacity-100 translate-x-0'
                              : 'opacity-0 -translate-x-4',
                          )}
                        >
                          <Link
                            to={link.path}
                            onClick={closeSearch}
                            className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 group"
                          >
                            <ArrowRight className="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                            <span>{link.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
