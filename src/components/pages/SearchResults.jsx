import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import boutiqueData from '../data/data';
import ProductDetail from '../layers/ProductDetails';
import { Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const q = query.trim().toLowerCase();
  const { addToCart } = useCart();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // flatten all products
  const allProducts = boutiqueData
    .flatMap(cat => cat.subcategories)
    .flatMap(sub => sub.products || []);

  const matches = q ? allProducts.filter(p => {
    const name = (p.name || '').toLowerCase();
    return name === q || name.startsWith(q);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {matches.map(product => (
          <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer" onClick={() => { setSelectedProduct(product); setIsOpen(true); }}>
            <div className="aspect-square overflow-hidden">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"/>
            </div>
            <div className="p-4">
              <span className="text-xs font-semibold text-orange-500 uppercase">{product.category}</span>
              <h3 className="font-bold mt-1 mb-2">{product.name}</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-gray-600">{product.rating} (avis)</span>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-xl font-bold">{product.price.toFixed(2)} DH</span>
                <button onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }} className=" bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-green-600">Ajouter au panier</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProductDetail product={selectedProduct} isOpen={isOpen} onClose={() => setIsOpen(false)} onAddToCart={(p) => addToCart(p,1)} />
    </section>
  );
}
