import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from '../../context/CartContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

export default function ProductFeatured({ product }) {
  const { addToCart } = useCart();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    if (!product) {
      // Charger la liste des produits en vedette depuis la table featured_products
      (async () => {
        try {
          const { data, error } = await supabase
            .from('featured_products')
            .select('product_id, added_at, products(*)')
            .order('added_at', { ascending: false });
          if (error) throw error;
          // data[i].products est un tableau contenant l'objet produit
          const products = (data || []).map((row) => row.products).flat().map(p => ({
            id: p.id,
            name: p.name,
            price: parseFloat(p.price || 0),
            rating: parseFloat(p.rating || 0),
            imageUrl: p.image_url,
            featured: p.featured,
            description: p.description || '',
          }));
          setFeatured(products);
        } catch (err) {
          console.warn('Erreur chargement featured products:', err);
        }
      })();
    }
  }, [product]);

  // Si un produit est fourni en prop, on rend la carte individuelle (comportement existant)
  if (product) {
    return (
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />

          {/* Badge */}
          {product.featured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Populaire
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Add to cart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 translate-y-full group-hover:translate-y-[-40%]  
            px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all duration-300 shadow-xl bg-white text-gray-900 hover:bg-blue-600 hover:text-white"
          >
            <ShoppingCart className="w-5 h-5" />
            Ajouter au panier
          </button>
        </div>

        {/* Infos */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mt-2 mb-1 group-hover:text-blue-500 transition-colors duration-200">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-800">
              {product.price.toFixed(2)} €
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Sinon, on rend la liste des produits en vedette
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {featured.map((p) => (
        <div key={p.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
          <div className="relative overflow-hidden aspect-square">
            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mt-2 mb-1 group-hover:text-blue-500 transition-colors duration-200">{p.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-800">{p.price.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
