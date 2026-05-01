import { ChevronDown, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { useCatalog } from '../../context/CatalogContext.jsx';

export function CategoriesDropdown() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  const TRANSITION_DURATION = 400;
  const ctx = useCatalog();

  // Initialize activeCategory
  useEffect(() => {
    if (ctx.categories?.length > 0 && !activeCategory) {
      setActiveCategory(ctx.categories[0]);
    }
  }, [ctx.categories, activeCategory]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const openDropdown = () => {
    setVisible(true);
    // Use requestAnimationFrame or a small timeout to ensure visibility transition works
    requestAnimationFrame(() => {
      setOpen(true);
    });
  };

  const closeDropdown = () => {
    setOpen(false);
    setTimeout(() => {
      setVisible(false);
    }, TRANSITION_DURATION);
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    if (!open) {
      openDropdown();
    } else {
      closeDropdown();
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={handleButtonClick}
        aria-expanded={open}
        className="flex items-center gap-2 group outline-none"
      >
        <span className={`text-lg font-medium transition-all duration-300 ${open ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
          Catalogue
        </span>
        <div className={`p-1 rounded-full transition-all duration-300 ${open ? 'bg-blue-50 rotate-180' : 'bg-transparent'}`}>
          <ChevronDown className={`w-4 h-4 transition-colors ${open ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
        </div>
      </button>

      {visible && createPortal(
        <div
          ref={dropdownRef}
          className={`
            fixed top-[90px] left-1/2 -translate-x-1/2 w-[95vw] max-w-5xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[2.5rem] overflow-hidden z-[9999] 
            flex flex-col md:flex-row transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border border-gray-100/80 backdrop-blur-3xl bg-white/95
            ${open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95 pointer-events-none"}
          `}
        >
          {/* Sidebar Categorie */}
          <div className="w-full md:w-1/4 bg-gray-50/80 border-r border-gray-100/50 p-6 flex flex-col gap-2 min-h-0 md:min-h-[450px] overflow-x-auto md:overflow-y-auto whitespace-nowrap md:whitespace-normal scrollbar-hide">
            <div className="hidden md:block mb-4 px-2">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] opacity-80">Rayons</h3>
            </div>
            <div className="flex md:flex-col gap-2">
              {ctx.loading ? (
                <div className="space-y-3 px-2 w-full">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-gray-200 animate-pulse rounded-xl" />)}
                </div>
              ) : ctx.categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    flex-shrink-0 md:w-full flex items-center justify-between px-5 py-4 rounded-2xl text-left transition-all duration-300 group/cat
                    ${activeCategory?.id === cat.id
                      ? "bg-white text-blue-600 shadow-md translate-x-0 md:translate-x-3 ring-1 ring-blue-100/50"
                      : "text-gray-500 hover:bg-white/60 hover:text-blue-600"}
                  `}
                >
                  <span className={`font-bold text-sm transition-all ${activeCategory?.id === cat.id ? 'scale-105' : ''}`}>
                    {cat.name}
                  </span>
                  <ArrowRight size={14} className={`hidden md:block transition-all duration-300 ${activeCategory?.id === cat.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories Display */}
          <div className="flex-1 p-6 md:p-10 bg-white relative overflow-y-auto max-h-[60vh] md:max-h-[75vh] scrollbar-hide">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-blue-100/20 rounded-full blur-[100px] pointer-events-none" />

            {activeCategory ? (
              <div
                key={activeCategory.id}
                className="relative animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.15em] rounded-full">
                      {activeCategory.subcategories?.length || 0} Univers disponibles
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                      {activeCategory.name}
                    </h2>
                  </div>
                  <NavLink
                    to={`/categorie/${activeCategory.id}`}
                    onClick={() => { closeDropdown(); }}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-blue-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-gray-200"
                  >
                    Voir toute la collection <ArrowRight size={16} />
                  </NavLink>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                  {(activeCategory.subcategories || []).map((sub) => (
                    <NavLink
                      key={sub.id}
                      to={`/souscategorie/${sub.id}`}
                      onClick={() => { closeDropdown(); }}
                      className="group/sub relative flex flex-col gap-4"
                    >
                      <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden bg-gray-50 shadow-sm transition-all duration-500 ring-1 ring-gray-100 group-hover/sub:ring-blue-200 group-hover/sub:-translate-y-2 group-hover/sub:shadow-2xl">
                        <img
                          src={sub.imageUrl || 'https://via.placeholder.com/400x400?text=Produit'}
                          alt={sub.name}
                          className="w-full h-full object-cover transition-all duration-700 group-hover/sub:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/sub:opacity-100 transition-opacity duration-500" />
                      </div>
                      <div className="text-center px-1">
                        <h4 className="font-black text-gray-800 text-xs md:text-sm group-hover/sub:text-blue-600 transition-colors uppercase tracking-tight line-clamp-2">
                          {sub.name}
                        </h4>
                        <div className="mt-2 flex items-center justify-center gap-2">
                           <span className="w-1 h-1 bg-blue-400 rounded-full" />
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {sub.products?.length || 0} Articles
                          </p>
                        </div>
                      </div>
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-300 space-y-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <ArrowRight size={32} className="opacity-20 animate-pulse" />
                </div>
                <p className="font-black uppercase tracking-[0.2em] text-[11px]">Veuillez sélectionner un rayon</p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
