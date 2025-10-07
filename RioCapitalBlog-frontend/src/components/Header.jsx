import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Menu, X, User, LogOut, Heart, PenTool, BadgeEuro, LayoutDashboard } from 'lucide-react';
import RioCapitalLogo from '../assets/litinvestor_logo.webp';
import UserAvatar from '../components/ui/UserAvatar';
import ExpandingSearchBar from './ExpandingSearchBar';

const Header = () => {
  const { user, logout, canWriteArticles, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileNavOpen, setIsProfileNavOpen] = useState(false);
  const [showWhiteNav, setShowWhiteNav] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) navigate('/');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileNav = () => setIsProfileNavOpen(!isProfileNavOpen);
  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileNavOpen(false);
  };

  // Gestione sparisci/ricompare navbar bianca - MIGLIORATA
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Mostra la navbar bianca se:
          // 1. Stiamo scrollando verso l'alto (anche di poco)
          // 2. Siamo in cima alla pagina
          if (currentScrollY < lastScrollY || currentScrollY < 10) {
            setShowWhiteNav(true);
          }
          // Nascondi solo se scrolliamo verso il basso e siamo oltre i 50px
          else if (currentScrollY > lastScrollY && currentScrollY > 50) {
            setShowWhiteNav(false);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Navbar nera sempre fissa */}
      <header
        className="backdrop-blur-md fixed top-0 left-0 w-full z-50"
        style={{ backgroundColor: '#313132' }}
      >
        <div className="max-w-[1012px] mx-auto px-[16px]">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-10">
              <Link to="/" className="flex-shrink-0">
                <img src={RioCapitalLogo} alt="Lit Investor Logo" className="h-7 w-auto" />
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-sm font-normal text-[#f5f5f7] hover:text-white">Home</Link>
                <Link to="/archive" className="text-sm font-normal text-[#f5f5f7] hover:text-white">Archive</Link>
                <Link to="/about-us" className="text-sm font-normal text-[#f5f5f7] hover:text-white">About Me</Link>
                <Link to="/contact" className="text-sm font-normal text-[#f5f5f7] hover:text-white">Contacts</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-10 flex-shrink-0">
              <Link to="/donate" className="hidden md:flex items-center text-sm font-normal text-[#f5f5f7] hover:text-white">
                <BadgeEuro className="w-4 h-4 mr-1" />
                <span>Drop a Tip</span>
              </Link>
              {user ? (
                <div onClick={toggleProfileNav} className="cursor-pointer">
                  <UserAvatar username={user.username} firstName={user.first_name} size={32} />
                </div>
              ) : (
                <Link to="/login" className="flex items-center space-x-1 text-sm font-normal text-[#f5f5f7] hover:text-white">
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
      </header>

      {/* Navbar bianca sparisce/ricompare - MIGLIORATA */}
      <div
        className={`bg-white absolute top-[56px] left-0 w-full z-40 transition-transform duration-150 ease-out`}
        style={{
          transform: showWhiteNav ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="max-w-[1012px] mx-auto px-[16px] h-14 flex items-center justify-between relative">
          <h2 className="text-xl font-semibold text-gray-800">Lit Investor Blog</h2>

          <div className={`transition-opacity duration-300 ${isProfileNavOpen ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-8">
                <Link to="/category/market-analysis" className="text-sm font-medium text-gray-500 hover:text-gray-900">References</Link>
                <Link to="/category/guides" className="text-sm font-medium text-gray-500 hover:text-gray-900">Services</Link>
              </nav>
              <ExpandingSearchBar />
            </div>
          </div>

          <div className={`absolute top-0 right-0 h-full flex items-center transition-opacity duration-300 ${isProfileNavOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <nav className="flex items-center gap-8">
              <Link to="/profile" onClick={closeAllMenus} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                <User className="w-4 h-4" />Profile
              </Link>
              <Link to="/favorites" onClick={closeAllMenus} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                <Heart className="w-4 h-4" />Favorites
              </Link>
              {canWriteArticles() && (
                <Link to="/admin/articoli/nuovo" onClick={closeAllMenus} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                  <PenTool className="w-4 h-4" />New Article
                </Link>
              )}
              {isAdmin() && (
                <Link to="/admin/dashboard" onClick={closeAllMenus} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                  <LayoutDashboard className="w-4 h-4" />Dashboard
                </Link>
              )}
            </nav>
            <div className="flex items-center gap-8 ml-8">
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                <LogOut className="w-4 h-4" />Logout
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); toggleProfileNav(); }} className="text-gray-500 hover:text-gray-900">
                <X className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contenuto principale della pagina */}
      <main className="mt-[112px]">
        {/* Qui va tutto il contenuto della tua pagina, articoli, immagini, testi, ecc */}
      </main>
    </>
  );
};

export default Header;
