import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { File, BookOpen, Tag } from 'lucide-react';

const Highlight = ({ text, matches, matchKey }) => {
  const titleMatch = matches.find(m => m.key === matchKey);
  const indices = titleMatch?.indices;
  if (!indices || indices.length === 0) return <span>{text}</span>;
  const highlighted = [];
  let lastIndex = 0;
  indices.forEach(([start, end], i) => {
    if (start > lastIndex)
      highlighted.push(<span key={`u-${i}`}>{text.substring(lastIndex, start)}</span>);
    highlighted.push(
      <strong
        key={`m-${i}`}
        className="text-gray-900 font-semibold group-hover:text-blue-700 transition-colors"
      >
        {text.substring(start, end + 1)}
      </strong>
    );
    lastIndex = end + 1;
  });
  if (lastIndex < text.length)
    highlighted.push(<span key="u-end">{text.substring(lastIndex)}</span>);
  return <>{highlighted}</>;
};

const SearchResultsDropdown = ({ results, rect, onResultClick }) => {
  if (!results || results.length === 0 || !rect) {
    return null;
  }

  const getIcon = (type) => {
    switch (type) {
      case 'article':
        return <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-blue-500 transition-colors" />;
      case 'page':
        return <File className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-blue-500 transition-colors" />;
      default:
        return <Tag className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-blue-500 transition-colors" />;
    }
  };

  const dropdownStyle = {
    position: 'absolute',
    top: `${rect.bottom + 4}px`, // 4px sotto il bordo inferiore dell'input
    left: `${rect.left}px`,      // Allineato al bordo sinistro dell'input
    width: `${rect.width}px`,    // Stessa larghezza dell'input
    zIndex: 1000,
  };

  return ReactDOM.createPortal(
    <div
      style={dropdownStyle}
      className="bg-trasparent rounded-lg overflow-hidden"
    >
      <ul>
        {results.map(({ item, matches }, index) => (
          <li key={item.slug + index}>
            <Link
              to={item.slug}
              onClick={onResultClick}
              className="group flex items-center gap-3 p-3 hover:bg-blue-50 w-full text-left transition-colors"
            >
              {getIcon(item.type)}
              <span className="text-sm text-gray-600 truncate group-hover:text-blue-500 transition-colors">
                <Highlight text={item.title} matches={matches} matchKey="title" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
};

export default SearchResultsDropdown;
