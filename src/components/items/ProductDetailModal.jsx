import React from 'react';
import { X, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';

export default function ProductDetailModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  if (!isOpen || !product) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="bg-gray-50 flex items-center justify-center p-8 md:p-12 min-h-[300px]">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="max-w-full max-h-[400px] object-contain drop-shadow-2xl rounded-2xl"
            />
          </div>

          {/* Details Section */}
          <div className="p-8 md:p-12 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                  Produit en vedette
                </span>
                {product.isInStock === false && (
                  <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    Rupture de stock
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">
                {product.name}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-black text-blue-600">
                  {product.price.toFixed(2)} DH
                </span>
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {product.reference && (
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Référence</p>
                <p className="text-lg font-bold text-gray-700">
                  {product.reference}
                </p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-bold text-gray-500">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <ShieldCheck size={16} />
                </div>
                Qualité Garantie
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Truck size={16} />
                </div>
                Livraison Rapide
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              <button
                disabled={product.isInStock === false}
                onClick={() => {
                  addToCart(product, 1);
                  onClose();
                }}
                className={`flex-1 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 ${
                  product.isInStock === false 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0'
                }`}
              >
                <ShoppingCart className="w-6 h-6" />
                Ajouter au panier
              </button>

              <button
                onClick={() => toggleFavorite(product)}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center ${
                  isFavorite(product.id)
                  ? 'bg-red-50 border-red-100 text-red-500'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                }`}
              >
                <Heart fill={isFavorite(product.id) ? 'currentColor' : 'none'} className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
