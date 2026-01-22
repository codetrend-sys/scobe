import React from 'react';
import { useCart } from '../../context/CartContext';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleValidate = () => {
    navigate('/checkout');
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Votre panier est vide</h2>
        <p className="text-gray-600">Ajoutez des produits puis revenez ici pour finaliser votre commande.</p>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Mon panier</h2>
        <button
          onClick={() => clearCart()}
          className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Vider le panier
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        {cartItems.map(item => (
          <div key={item.id} className="flex items-center gap-4 border-b pb-4">
            <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover rounded" />
            <div className="flex-1">
              <h3 className="font-semibold">{item.product.name}</h3>
              <p className="text-sm text-gray-500">{item.product.category}</p>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{(item.product.price * item.quantity).toFixed(2)} DH</div>
              <div className="text-sm text-gray-500">{item.product.price.toFixed(2)} DH / unité</div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between mt-4">
          <div className="text-lg font-semibold">Total</div>
          <div className="text-2xl font-bold text-blue-600">{total.toFixed(2)} DH</div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleValidate}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Valider le panier
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    </section>
  );
}
