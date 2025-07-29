import React, { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  onClear,
  className = "",
  showClearButton = true,
  disabled = false,
  initialValue = "",
  debounceMs = 150 // Lebih cepat untuk real-time feel
}) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Create debounced search function dengan optimasi
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (onSearch) {
        setIsSearching(true);
        try {
          await onSearch(query);
        } finally {
          setIsSearching(false);
        }
      }
    }, debounceMs),
    [onSearch, debounceMs]
  );

  // Handle input change dengan optimasi
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    // Cancel previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set isSearching to true immediately untuk visual feedback
    if (value.trim() !== searchValue.trim()) {
      setIsSearching(true);
    }
    
    // Call debounced search
    debouncedSearch(value.trim());
    
    // Timeout fallback untuk memastikan isSearching di-reset
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearching(false);
    }, debounceMs + 100);
  };

  // Handle clear button
  const handleClear = () => {
    setSearchValue("");
    setIsSearching(false);
    
    // Cancel any pending searches
    debouncedSearch.cancel();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (onClear) {
      onClear();
    }
    if (onSearch) {
      onSearch("");
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
    // Enter key bisa juga trigger immediate search
    else if (e.key === 'Enter') {
      e.preventDefault();
      debouncedSearch.cancel(); // Cancel debounced
      if (onSearch) {
        setIsSearching(true);
        onSearch(searchValue.trim()).finally(() => setIsSearching(false));
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [debouncedSearch]);

  // Update local state if initialValue changes
  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  return (
    <div className={`relative ${className}`}>
      <div className={`relative transition-all duration-200 ${
        isFocused ? 'ring-1 ring-black ring-opacity-50 rounded-lg' : ''
      }`}>
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className={`h-5 w-5 transition-colors duration-200 ${
              isFocused ? 'text-blue-500' : 'text-gray-400'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Input Field */}
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-2 
            border border-gray-300 rounded-lg
            leading-5 bg-white placeholder-gray-500
            focus:outline-none focus:placeholder-gray-400 
            focus:ring-1 focus:ring-black
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-all duration-200
            sm:text-sm
          `}
        />

        {/* Right side icons */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
          {/* Loading indicator - Lebih subtle */}
          {isSearching && !disabled && (
            <div className="flex items-center">
              <div className="animate-spin h-3 w-3 border border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {/* Clear Button */}
          {showClearButton && searchValue && !disabled && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200 p-1"
              title="Clear search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Global Loading overlay jika disabled */}
        {disabled && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
      
      {/* Search status indicator */}
      {searchValue && (
        <div className="absolute top-full left-0 mt-1 text-xs text-gray-500">
          {isSearching ? (
            <span className="text-blue-600"></span>
          ) : (
            <span className="text-green-600"></span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;