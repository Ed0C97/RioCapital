// LitInvestorBlog-frontend/src/components/ExpandingSearchBar.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import SearchResultsDropdown from './SearchResultsDropdown';
import directLinks from '../data/directLinks.json';

const ExpandingSearchBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(true);

  const { searchQuery, setSearchQuery, results } = useSearch();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const searchBarRef = useRef(null);
  const [dropdownRect, setDropdownRect] = useState(null);

  const toggleSearch = () => {
    const nextIsExpanded = !isExpanded;
    setIsExpanded(nextIsExpanded);
    if (nextIsExpanded) {
      setIsDropdownVisible(true);
    }
    if (!nextIsExpanded) {
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (inputRef.current) {
        setDropdownRect(inputRef.current.getBoundingClientRect());
      }
    };
    const shouldShowDropdown =
      isExpanded && results.length > 0 && isDropdownVisible;
    if (shouldShowDropdown) {
      handleResize();
      window.addEventListener('resize', handleResize);
    } else {
      setDropdownRect(null);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isExpanded, results.length, isDropdownVisible]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setIsDropdownVisible(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      if (directLinks[query]) navigate(directLinks[query]);
      else if (results.length > 0 && results[0].score < 0.1)
        navigate(results[0].item.slug);
      else navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery('');
      setIsExpanded(false);
    }
  };

  const handleResultClick = () => {
    setSearchQuery('');
    setIsExpanded(false);
  };

  return (
    <div className="relative flex items-center" ref={searchBarRef}>
      <div
        onClick={toggleSearch}
        className="cursor-pointer text-gray-500 hover:text-gray-900"
      >
        <Search className="w-4 h-4" />
      </div>
      <div
        className={`transition-all duration-300 ${isExpanded ? 'w-64 opacity-100 ml-2' : 'w-0 opacity-0'}`}
      >
        {}
        <form onSubmit={handleFormSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search the blog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsDropdownVisible(true)}
            className="w-full text-sm rounded-md px-2 py-1 focus:outline-none"
            autoFocus={isExpanded}
          />
        </form>
      </div>
      <SearchResultsDropdown
        results={results}
        rect={dropdownRect}
        onResultClick={handleResultClick}
      />
    </div>
  );
};

export default ExpandingSearchBar;
