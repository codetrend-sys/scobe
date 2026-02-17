import { Search } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

export function SearchBar({ mobile = false, onSearch } ) {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();

  function handleSearch() {
    const q = term.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    // keep the value in the input so the user can refine or see what was searched
    // setTerm('');
    if (typeof onSearch === 'function') onSearch();
  }

  // classes differ for mobile vs desktop
  const base = mobile ? 'flex items-center gap-2' : 'hidden md:flex items-center gap-2';
  const containerClass = `${base} border border-green-600 bg-green-100 rounded-full px-4 py-2 hover:bg-gray-200 transition-colors`;
  const inputClass = mobile ? 'bg-transparent text-green-700 border-none outline-none text-sm w-full' : 'bg-transparent text-green-700 border-none outline-none text-sm w-48';

  return (
    <div className={containerClass}>
      <Search
        className="w-5 h-5 text-green-600 cursor-pointer"
        onClick={handleSearch}
      />

      <input
        type="text"
        placeholder="Rechercher..."
        className={inputClass}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
    </div>
  );
}
