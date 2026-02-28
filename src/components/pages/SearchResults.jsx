import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductDetail from '../layers/ProductDetails';
import { Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCatalog } from '../../context/CatalogContext.jsx';
import FavoriteButton from '../common/FavoriteButton.jsx';
import ScrollToTopButton from '../items/ScrollToTopButton.jsx';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const q = query.trim().toLowerCase();
  const { addToCart } = useCart();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const { categories, loading } = useCatalog();
  // flatten all products
  const allProducts = (categories || []).flatMap(cat => (cat.subcategories || []).flatMap(sub => (sub.products || []).map(p => ({ ...p, category: cat.name }))));

  const matches = q ? allProducts.filter(p => {
    const name = (p.name || '').toLowerCase();
    const ref = (p.reference || '').toLowerCase();
    // match if query appears anywhere in the product name or exactly equals reference
    return name.includes(q) || (ref && ref === q);
  }) : [];

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Résultats de la recherche</h2>
        <p className="text-gray-600 mt-2">{query ? `Produits correspondant à "${query}"` : 'Aucun terme de recherche'}</p>
      </div>

      {q && matches.length === 0 && (
        <div className="text-center text-gray-600">Aucun produit trouvé pour ce terme.</div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mt-6">
        {matches.map(product => (
          <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer relative" onClick={() => { setSelectedProduct(product); setIsOpen(true); }}>
            <div className="aspect-square overflow-hidden relative">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              {product.isInStock === false && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform -rotate-12 border-2 border-white">
                    RUPTURE
                  </span>
                </div>
              )}
            </div>
            <div className="absolute top-3 right-3">
              <FavoriteButton product={product} />
            </div>
            <div className="p-3">
              <span className="text-xs font-semibold text-orange-500 uppercase">{product.category}</span>
              <h3 className="font-bold mt-0.5 mb-1 text-sm line-clamp-1">{product.name}</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-gray-600">{product.rating} (avis)</span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-bold">{product.price.toFixed(2)} DH</span>
                {product.isInStock !== false ? (
                  <button onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }} className=" bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs hover:bg-green-600">Ajouter au panier</button>
                ) : (
                  <span className="text-red-600 font-bold text-sm">Rupture</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProductDetail product={selectedProduct} isOpen={isOpen} onClose={() => setIsOpen(false)} onAddToCart={(p) => addToCart(p, 1)} />
      <ScrollToTopButton minScroll={100} />
    </section>
  );
}
