import { X, Star } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import ProductDetailModal from '../items/ProductDetailModal.jsx';

export default function Favorites() {
  const { favorites, removeFavorite } = useFavorites();
  const { addToCart } = useCart();

  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!favorites || favorites.length === 0) {
    return (
      <p className="text-center py-20 text-gray-500">Vous n'avez aucun produit dans vos favoris.</p>
    );
  }

  const openConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.onConfirm) await confirmDialog.onConfirm();
    closeConfirmDialog();
  };

  const handleRemoveClick = (productId, productName) => {
    openConfirmDialog(
      'Retirer des favoris',
      `Voulez-vous vraiment retirer "${productName}" de vos favoris ?`,
      async () => {
        try {
          setError('');
          const res = await removeFavorite(productId);
          if (!res?.ok) {
            setError(res?.error || 'Impossible de retirer le favori');
          }
        } catch (err) {
          console.error('Erreur suppression favori:', err);
          setError(err?.message || 'Erreur suppression favori');
        }
      }
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold mb-8 text-center">Mes Favoris</h2>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-2xl shadow-md overflow-hidden relative cursor-pointer group"
            onClick={() => {
              setSelectedProduct({
                id: product.product_id,
                name: product.product_name,
                price: Number(product.product_price),
                imageUrl: product.product_image_url,
                category: product.category || 'Produit',
                rating: product.rating || 0,
                reference: product.reference || ''
              });
              setIsModalOpen(true);
            }}
          >
            <div className="aspect-square overflow-hidden">
              <img src={product.product_image_url} alt={product.product_name} className="w-full h-full object-cover hover:scale-110 transition duration-500" />
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveClick(product.product_id, product.product_name);
              }} 
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-4">
              <span className="text-xs font-semibold text-orange-500 uppercase">{product.category || 'Produit'}</span>
              <h3 className="font-bold mt-1 mb-2">{product.product_name}</h3>

              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-gray-600">{product.rating || 0} (avis)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">{Number(product.product_price).toFixed(2)} DH</span>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation();
                    addToCart({ id: product.product_id, name: product.product_name, price: product.product_price, imageUrl: product.product_image_url, category: product.category, rating: product.rating }, 1); 
                  }} 
                  className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-green-600 transition-colors"
                >
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-red-700">{confirmDialog.title}</h2>
            <p className="text-gray-700 mt-2 mb-4">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={closeConfirmDialog} className="px-4 py-2 rounded border">Annuler</button>
              <button onClick={handleConfirmAction} className="px-4 py-2 rounded bg-red-600 text-white">Confirmer</button>
            </div>
          </div>
        </div>
      )}
      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}
