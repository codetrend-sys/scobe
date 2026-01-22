import { X, Star } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';

export default function Favorites() {
  const { favorites, removeFavorite } = useFavorites();
  const { addToCart } = useCart();

  if (favorites.length === 0) {
    return (
      <p className="text-center py-20 text-gray-500">
        Vous n'avez aucun produit dans vos favoris.
      </p>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold mb-8 text-center">Mes Favoris</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map(product => (
          <div key={product.id} className="bg-white rounded-2xl shadow-md overflow-hidden relative">
            <div className="aspect-square overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition duration-500"
              />
            </div>

            {/* Retirer des favoris */}
            <button
              onClick={() => removeFavorite(product.id)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-4">
              <span className="text-xs font-semibold text-orange-500 uppercase">
                {product.category}
              </span>
              <h3 className="font-bold mt-1 mb-2">{product.name}</h3>

              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">{product.rating} (avis)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">{product.price.toFixed(2)} DH</span>
                <button
                  onClick={() => addToCart(product, 1)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-green-600"
                >
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
