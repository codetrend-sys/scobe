import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';

export default function FavoriteButton({ product, className = '' }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = async (e) => {
    if (e) e.stopPropagation();
    const res = await toggleFavorite(product);
    if (!res?.ok) {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className={`${className} rounded-full p-1 text-gray-300 hover:text-red-500 transition-all duration-300`}
        aria-label="Ajouter aux favoris"
      >
        <Heart
          fill={isFavorite(product.id) ? 'currentColor' : 'none'}
          className={`w-7 h-6 transition-transform duration-300 ${isFavorite(product.id) ? 'text-red-500 scale-110' : 'text-gray-800'}`}
        />
      </button>

      {showPopup && typeof document !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 bg-black/20 z-[60]" onClick={(e) => { e.stopPropagation(); setShowPopup(false); }} />
          <div className="fixed inset-0 flex items-center justify-center z-[70]" onClick={(e) => e.stopPropagation()}>
            <div className="w-80 bg-white rounded-xl shadow-2xl ring-1 ring-black/10">
              <div className="flex items-start justify-between p-5">
                <div className="flex-1 pr-3">
                  <h4 className="text-base font-bold text-gray-900">Connectez-vous pour continuer</h4>
                  <p className="text-sm text-gray-700 mt-2">Vous devez être connecté pour ajouter cet article à vos favoris.</p>
                  <div className="mt-4 flex gap-2">
                    <Link to="/login" onClick={(e) => { e.stopPropagation(); }} className="inline-block px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Se connecter</Link>
                    <button onClick={(e) => { e.stopPropagation(); setShowPopup(false); }} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">Annuler</button>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setShowPopup(false); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
