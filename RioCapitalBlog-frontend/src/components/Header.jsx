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
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Header = () => {
  const { user, logout, canWriteArticles, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  return (
    <header className="backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50" style={{backgroundColor: '#313132'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-6 h-6 RioCapitalBlog-gradient rounded-md flex items-center justify-center">
              <span className="text-white font-semibold text-sm">F</span>
            </div>
            <span className="text-base font-medium text-white RioCapitalBlog-text-gradient hidden sm:block">RioCapitalBlog</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center justify-center flex-1 max-w-2xl mx-8">
            <div className="flex items-center space-x-12">
              <Link
                to="/"
                className="text-sm font-normal text-gray-300 hover:text-white transition-colors duration-200 py-2"
              >
                Home
              </Link>
              <Link
                to="/archivio"
                className="text-sm font-normal text-gray-300 hover:text-white transition-colors duration-200 py-2"
              >
                Archivio
              </Link>
              <Link
                to="/chi-siamo"
                className="text-sm font-normal text-gray-300 hover:text-white transition-colors duration-200 py-2"
              >
                Chi Siamo
              </Link>
              <Link
                to="/contatti"
                className="text-sm font-normal text-gray-300 hover:text-white transition-colors duration-200 py-2"
              >
                Contatti
              </Link>
            </div>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-5 flex-shrink-0">
            {/* Search - Desktop */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  type="text"
                  placeholder="Cerca articoli..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 w-48 text-sm bg-gray-700/80 border-gray-600 text-white placeholder-gray-400 rounded-md focus:bg-gray-600 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all duration-200"
                />
              </div>
            </form>

            {/* Dona Button */}
            <Link to="/dona" className="hidden md:block">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-normal text-gray-300 hover:text-white hover:bg-gray-600/50 px-3 py-1.5 h-auto transition-colors duration-200"
              >
                <Heart className="w-3.5 h-3.5 mr-1.5" />
                Dona
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-normal text-gray-300 hover:text-white hover:bg-gray-600/50 px-3 py-1.5 h-auto transition-colors duration-200"
                  >
                    <User className="w-3.5 h-3.5 mr-1.5" />
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-lg rounded-lg mt-1"
                >
                  <DropdownMenuItem asChild>
                    <Link to="/profilo" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4" />
                      <span>Profilo</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/preferiti" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Heart className="w-4 h-4" />
                      <span>Preferiti</span>
                    </Link>
                  </DropdownMenuItem>

                  {canWriteArticles() && (
                    <>
                      <DropdownMenuSeparator className="bg-gray-200/50" />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/articoli" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <FileText className="w-4 h-4" />
                          <span>I Miei Articoli</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/articoli/nuovo" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <PenTool className="w-4 h-4" />
                          <span>Nuovo Articolo</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {isAdmin() && (
                    <>
                      <DropdownMenuSeparator className="bg-gray-200/50" />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Settings className="w-4 h-4" />
                          <span>Dashboard Admin</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/analytics" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <BarChart3 className="w-4 h-4" />
                          <span>Analytics</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/commenti" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <MessageSquare className="w-4 h-4" />
                          <span>Moderazione</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/donazioni" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <DollarSign className="w-4 h-4" />
                          <span>Donazioni</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator className="bg-gray-200/50" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-normal text-gray-300 hover:text-white hover:bg-gray-600/50 px-3 py-1.5 h-auto transition-colors duration-200"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 h-auto rounded-md transition-colors duration-200"
                  >
                    Registrati
                  </Button>
                </Link>
              </div>
            )}

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
                Archivio
              </Link>
              <Link
                to="/chi-siamo"
                className="block px-3 py-2 text-sm font-normal text-gray-300 hover:text-white hover:bg-gray-600/50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Chi Siamo
              </Link>
              <Link
                to="/contatti"
                className="block px-3 py-2 text-sm font-normal text-gray-300 hover:text-white hover:bg-gray-600/50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contatti
              </Link>
              <Link
                to="/dona"
                className="block px-3 py-2 text-sm font-normal text-gray-300 hover:text-white hover:bg-gray-600/50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="w-4 h-4 inline mr-2" />
                Dona
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
