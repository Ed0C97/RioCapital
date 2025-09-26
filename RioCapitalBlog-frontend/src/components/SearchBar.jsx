import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const SearchBar = ({ isExpanded, toggleSearch, searchQuery, setSearchQuery, handleSearch }) => {

  // Blocca lo scroll quando la barra è aperta
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isExpanded]);

  if (!isExpanded) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 backdrop-blur-xl bg-black/40 transition-opacity duration-300">
      <div className="relative w-full max-w-lg">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca articoli..."
            autoFocus
            className="w-full py-4 px-6 text-lg rounded-xl bg-white/20 backdrop-blur-md text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
          />
          <button
            type="button"
            onClick={toggleSearch}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-white hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;
