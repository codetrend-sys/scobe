import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
export default function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout, onClearCart }) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const { clearCart } = useCart();
  
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" onClick={onClose} />

      {/* Slide Cart */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[9999] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Panier</h2>

          <div className="flex items-center gap-3">
            {/* Bouton Vider le panier */}
            {items.length > 0 && (
              <button
               onClick={() => clearCart()}
                className="p-2 hover:bg-red-100 rounded-full transition-colors"
                title="Vider le panier"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </button>
            )}

            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Fermer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Corps du panier */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <ShoppingBag className="h-24 w-24 mb-4" />
            <p className="text-lg font-semibold">Votre panier est vide</p>
            <p className="text-sm">Ajoutez des produits pour commencer</p>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex space-x-4 bg-gray-50 rounded-lg p-4">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">
                      {item.product.name}
                    </h3>
                    <p className="text-blue-600 font-bold">
                      {item.product.price.toFixed(2)} DH
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-auto p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer avec sous-total et boutons */}
            <div className="border-t p-6 space-y-4">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Sous-total:</span>
                <span className="font-bold text-blue-600">{total.toFixed(2)} DH</span>
              </div>

              <button
                onClick={() => onCheckout && onCheckout()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
              >
                Commander
              </button>

              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Continuer les achats
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
