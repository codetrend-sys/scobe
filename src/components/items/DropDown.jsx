import { ChevronDown, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useCatalog } from '../../context/CatalogContext.jsx';

export function CategoriesDropdown() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);

  const OPEN_DELAY = 100;
  const CLOSE_DELAY = 800;
  const TRANSITION_DURATION = 400;

  const ctx = useCatalog();

  // Initialize activeCategory with the first one when loaded
  useEffect(() => {
    if (ctx.categories?.length > 0 && !activeCategory) {
      setActiveCategory(ctx.categories[0]);
    }
  }, [ctx.categories, activeCategory]);

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setVisible(true);
    openTimer.current = setTimeout(() => setOpen(true), OPEN_DELAY);
  };

  const handleMouseLeave = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    setOpen(false);
    closeTimer.current = setTimeout(() => setVisible(false), Math.max(CLOSE_DELAY, TRANSITION_DURATION));
  };

  const handleButtonClick = () => {
    if (!visible) {
      setVisible(true);
      setTimeout(() => setOpen(true), 20);
    } else if (open) {
      setOpen(false);
      closeTimer.current = setTimeout(() => setVisible(false), TRANSITION_DURATION);
    } else {
      setOpen(true);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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

      {visible && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`
            fixed top-[75px] left-1/2 -translate-x-1/2 w-[95vw] max-w-5xl bg-white shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[2rem] overflow-hidden z-[100] 
            flex flex-col md:flex-row transform transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] border border-gray-100/50 backdrop-blur-2xl bg-white/95
            ${open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95 pointer-events-none"}
            before:content-[''] before:absolute before:-top-8 before:left-0 before:right-0 before:h-8 before:bg-transparent
          `}
        >
          {/* Sidebar Categorie */}
          <div className="w-full md:w-1/5 bg-gray-50/50 border-r border-gray-100/50 p-4 flex flex-col gap-1 min-h-0 md:min-h-[400px] overflow-x-auto md:overflow-y-auto whitespace-nowrap md:whitespace-normal scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="hidden md:block mb-4 px-2">
              <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-60">Rayons</h3>
            </div>
            <div className="flex md:flex-col gap-1">
              {ctx.loading ? (
                <div className="space-y-2 px-2 w-full">
                  {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-lg" />)}
                </div>
              ) : ctx.categories?.map((cat) => (
                <button
                  key={cat.id}
                  onMouseEnter={() => setActiveCategory(cat)}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    flex-shrink-0 md:w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-300 group/cat
                    ${activeCategory?.id === cat.id
                      ? "bg-white text-blue-600 shadow-sm translate-x-0 md:translate-x-2 ring-1 ring-blue-50"
                      : "text-gray-500 hover:bg-white/40 hover:text-blue-600"}
                  `}
                >
                  <span className={`font-bold text-xs transition-all ${activeCategory?.id === cat.id ? 'scale-105' : ''}`}>
                    {cat.name}
                  </span>
                  <ArrowRight size={12} className={`hidden md:block transition-all duration-300 ${activeCategory?.id === cat.id ? 'opacity-100' : 'opacity-0 -translate-x-1'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories Display */}
          <div className="flex-1 p-6 md:p-8 bg-white relative overflow-y-auto max-h-[60vh] md:max-h-[70vh] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-50/30 rounded-full blur-[80px] pointer-events-none" />

            {activeCategory ? (
              <div
                key={activeCategory.id}
                className="relative animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full">
                      {activeCategory.subcategories?.length || 0} Univers
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">
                      {activeCategory.name}
                    </h2>
                  </div>
                  <NavLink
                    to={`/categorie/${activeCategory.id}`}
                    onClick={() => { setOpen(false); setVisible(false); }}
                    className="flex items-center justify-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-full font-bold text-xs hover:bg-blue-600 transition-all duration-300"
                  >
                    Voir tout <ArrowRight size={14} />
                  </NavLink>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {(activeCategory.subcategories || []).map((sub) => (
                    <NavLink
                      key={sub.id}
                      to={`/souscategorie/${sub.id}`}
                      onClick={() => { setOpen(false); setVisible(false); }}
                      className="group/sub relative flex flex-col gap-3"
                    >
                      <div className="relative w-full aspect-square rounded-[1.5rem] overflow-hidden bg-gray-50 shadow-sm transition-all duration-500 ring-1 ring-gray-100 group-hover/sub:ring-blue-100 group-hover/sub:-translate-y-1.5 group-hover/sub:shadow-lg">
                        <img
                          src={sub.imageUrl || 'https://via.placeholder.com/400x400?text=Produit'}
                          alt={sub.name}
                          className="w-full h-full object-cover transition-all duration-500 group-hover/sub:scale-110"
                        />
                      </div>
                      <div className="text-center">
                        <h4 className="font-black text-gray-800 text-[11px] md:text-xs group-hover/sub:text-blue-600 transition-colors uppercase tracking-tight">
                          {sub.name}
                        </h4>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                          {sub.products?.length || 0} Produits
                        </p>
                      </div>
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-300 space-y-4">
                <ArrowRight size={32} className="opacity-20 translate-y-2 animate-bounce" />
                <p className="font-black uppercase tracking-widest text-[10px]">Sélectionnez une catégorie</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
