import { useParams } from "react-router-dom";
import Product from "./Product.jsx";
import { useState, useRef, useEffect } from "react";
import { useCatalog } from '../../context/CatalogContext.jsx';
import { ChevronUp } from 'lucide-react';

export default function SousCategorieCard() {
  const { id } = useParams(); // id de la catégorie
  const { categories, loading } = useCatalog();
  const category = categories.find(cat => String(cat.id) === String(id));

  const [selectedCat, setSelectedCat] = useState(null); // stocke la sous-catégorie sélectionnée
  const productsRef = useRef(null); // référence pour le scroll

  // trouve l'ancêtre scrollable le plus proche d'un élément
  const findScrollableAncestor = (el) => {
    let node = el;
    while (node && node !== document.body) {
      try {
        const style = window.getComputedStyle(node);
        if (node.scrollHeight > node.clientHeight && (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto' || style.overflow === 'scroll')) {
          return node;
        }
      } catch (e) {}
      node = node.parentNode;
    }
    return window;
  };

  const handleLocalScrollToTop = () => {
    try {
      // Primary: scroll the nearest scrollable ancestor
      const primary = productsRef.current ? findScrollableAncestor(productsRef.current) : window;
      console.log('localScrollToTop primary container:', primary === window ? 'window' : primary);
      if (primary === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        primary.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => { primary.scrollTop = 0; }, 150);
      }

      // Aggressive fallback: also scroll any scrollable ancestors up to body
      let node = productsRef.current || document.body;
      while (node && node !== document.body) {
        try {
          if (node.scrollHeight > node.clientHeight) {
            try { node.scrollTo({ top: 0, behavior: 'smooth' }); } catch(e) { node.scrollTop = 0; }
          }
        } catch (e) {}
        node = node.parentNode;
      }

      // Final fallback: ensure window at top
      setTimeout(() => { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, 250);
    } catch (e) {
      console.error('handleLocalScrollToTop error', e);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll automatique vers les produits quand une sous-catégorie est sélectionnée
  useEffect(() => {
    if (selectedCat && productsRef.current) {
      setTimeout(() => {
        productsRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 0);
    }
  }, [selectedCat]);

  if (loading) return <p className="text-center py-20">Chargement...</p>;
  if (!category) return <p className="text-center py-20">Catégorie introuvable</p>;

  return (
    <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* --- TITRE --- */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Sous-catégories de {category.name}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explorez notre large gamme de produits organisés par sous-catégorie pour faciliter votre recherche
        </p>
      </div>

      {/* --- GRILLE DES SOUS-CATEGORIES --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-center">
        {category.subcategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedCat(sub)} // stocke directement l'objet sous-catégorie
            className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={sub.imageUrl}
                alt={sub.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
              <div className="text-white">
                <h3 className="text-lg font-bold">{sub.name}</h3>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* --- PRODUITS DE LA SOUS-CATEGORIE SELECTIONNEE --- */}
      {selectedCat && (
        <div ref={productsRef} className="mt-16 ">
          <Product subCategory={selectedCat} hideScrollButton={true} />
        </div>
      )}

      {/* Always-visible local scroll-to-top for subcategory selection (prevents flicker) */}
      {selectedCat && (
        <button
          onClick={handleLocalScrollToTop}
          aria-label="Remonter en haut"
          title="Remonter en haut"
          className="fixed bottom-24 right-7 bg-blue-300 hover:bg-blue-700 text-white rounded-full p-3 shadow-2xl transition-all duration-300 z-[70] pointer-events-auto"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </section>
  );
}
