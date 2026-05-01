import { Search, Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useCatalog } from "../../context/CatalogContext";

export function SearchBar({ mobile = false, onSearch }) {
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { categories, loading } = useCatalog();
  const searchRef = useRef(null);
  const isSearchPage = window.location.pathname === '/search';

  // Flatten all products from categories and subcategories
  const allProducts = React.useMemo(() => {
    if (!categories) return [];
    return categories.flatMap(cat => 
      (cat.subcategories || []).flatMap(sub => 
        (sub.products || []).map(p => ({ 
          ...p, 
          categoryName: cat.name 
        }))
      )
    );
  }, [categories]);

  // Debounced URL update for search page
  useEffect(() => {
    if (!isSearchPage || term.trim() === '') return;

    const timeoutId = setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(term.trim())}`, { replace: true });
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [term, isSearchPage, navigate]);

  // Update suggestions when term changes
  useEffect(() => {
    const q = term.trim().toLowerCase();
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }

    const matches = allProducts.filter(p => {
      const name = (p.name || '').toLowerCase();
      const ref = (p.reference || '').toLowerCase();
      return name.includes(q) || (ref && ref === q);
    }).slice(0, 8); // Limit to 8 suggestions

    setSuggestions(matches);
  }, [term, allProducts]);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(selectedTerm) {
    const q = (selectedTerm || term).trim();
    if (!q) return;
    
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setShowSuggestions(false);
    if (typeof onSearch === 'function') onSearch();
  }

  function handleSelectProduct(product) {
    // Navigate to search results with the specific product name
    // or we could navigate to a specific product route if it existed.
    // Given the current architecture, search page is the best destination.
    handleSearch(product.name);
  }

  // classes differ for mobile vs desktop
  const base = mobile ? 'flex items-center gap-2' : 'hidden md:flex items-center gap-2';
  const containerClass = `relative ${base}`;
  const inputContainerClass = `flex items-center gap-2 border border-green-600 bg-green-100 rounded-full px-4 py-2 hover:bg-gray-200 transition-all duration-300 w-full`;
  const inputClass = mobile ? 'bg-transparent text-green-700 border-none outline-none text-sm w-full' : 'bg-transparent text-green-700 border-none outline-none text-sm w-48 focus:w-64 transition-all duration-300';

  return (
    <div className={containerClass} ref={searchRef}>
      <div className={inputContainerClass}>
        {loading ? (
          <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
        ) : (
          <Search
            className="w-5 h-5 text-green-600 cursor-pointer hover:scale-110 transition-transform"
            onClick={() => handleSearch()}
          />
        )}

        <input
          type="text"
          placeholder="Rechercher un produit..."
          className={inputClass}
          value={term}
          onFocus={() => setShowSuggestions(true)}
          onChange={(e) => {
            setTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && term.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in">
          <div className="max-h-[400px] overflow-y-auto">
            {suggestions.length > 0 ? (
              <>
                <div className="p-3 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Suggestions de produits
                </div>
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 hover:bg-green-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-orange-500 font-medium">
                        {product.categoryName}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-green-600 whitespace-nowrap">
                      {product.price.toFixed(2)} DH
                    </div>
                  </div>
                ))}
                <div 
                  className="p-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors border-t border-gray-100"
                  onClick={() => handleSearch()}
                >
                  Voir tous les résultats pour "{term}"
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-gray-500 text-sm">
                Aucun produit trouvé pour "{term}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
