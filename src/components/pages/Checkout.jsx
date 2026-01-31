import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Checkout() {
  const { cartItems, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Shipping form state (payment is only cash on delivery)
  const [fullname, setFullname] = useState(user?.name || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!fullname || !address || !city  || !phone) {
      setError('Veuillez remplir toutes les informations de livraison.');
      return false;
    }
    // No card validation: only paiement à la livraison is supported
    setError('');
    return true;
  };

  const handleCheckout = async () => {
  if (!validate()) return;

  setSubmitting(true);
  setError('');

  const orderId = `guest-${Date.now()}`;

  const order = {
    id: orderId,
    shipping: { fullname, address, city, phone },
    items: cartItems.map(i => ({
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    })),
    total,
    createdAt: new Date().toISOString(),
  };

  // 📝 Texte lisible pour l’email
  const itemsText = order.items
    .map(
      item =>
        `• ${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)} DH`
    )
    .join('\n');

  const formData = new URLSearchParams();
  formData.append('order_id', order.id);
  formData.append('fullname', fullname);
  formData.append('phone', phone);
  formData.append('city', city);
  formData.append('address', address);
  formData.append('items', itemsText);
  formData.append('total', `${order.total.toFixed(2)} DH`);
  formData.append('payment_method', 'Paiement à la livraison');
  formData.append('created_at', order.createdAt);

  // Options Formsubmit
  formData.append('_subject', `🛒 Nouvelle commande #${order.id}`);
  formData.append('_template', 'table');
  formData.append('_captcha', 'false');

  try {
    // Enregistrer la commande dans Supabase (table: orders)
    try {
      const { data: inserted, error: insertErr } = await supabase
        .from('orders')
        .insert([
          {
            order_id: order.id,
            user_id: user?.id ?? null,
            shipping: order.shipping,
            items: order.items,
            total: order.total,
            status: 'pending',
            created_at: order.createdAt,
          },
        ])
        .select()
        .single();

      if (insertErr) {
        console.error('Erreur insertion commande Supabase', insertErr);
        setError(`Commande créée localement, mais échec d'enregistrement sur le serveur: ${insertErr.message || insertErr}`);
      } else {
        console.info('Commande enregistrée dans Supabase', inserted);
      }
    } catch (supErr) {
      console.error('Erreur Supabase:', supErr);
      setError("Impossible d'enregistrer la commande sur le serveur.");
    }

    // Envoi Formsubmit (email)
    const res = await fetch('https://formsubmit.co/nissrinmahan02@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: formData.toString(),
    });

    if (!res.ok) throw new Error('Erreur Formsubmit');

    clearCart();
    sendToWhatsApp(order);
    navigate('/order-confirmation');

  } catch (e) {
    console.error(e);
    setError("Impossible d'envoyer la commande. Veuillez réessayer.");
  } finally {
    setSubmitting(false);
  }
};



  if (!cartItems || cartItems.length === 0) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Votre panier est vide</h2>
        <p className="text-gray-600">Ajoutez des produits puis revenez ici pour finaliser votre commande.</p>
      </section>
    );
  }

  const sendToWhatsApp = (order) => {
  const phoneNumber = "212693393610"; //

  const itemsText = order.items
    .map(
      (item) =>
        `• ${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)} DH`
    )
    .join('%0A');

  const message = `
  🛒 *Nouvelle commande*
  --------------------
  👤 Nom : ${order.shipping.fullname}
  📞 Téléphone : ${order.shipping.phone}
  📍 Ville : ${order.shipping.city}
  🏠 Adresse : ${order.shipping.address}

  📦 Produits :
  ${itemsText}

  💰 Total : ${order.total.toFixed(2)} DH
  🕒 Date : ${new Date(order.createdAt).toLocaleString()}
  `;

  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  window.open(whatsappURL, '_blank');
};


  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Récapitulatif de la commande</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center gap-4 border-b pb-4">
              <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover rounded" />
              <div className="flex-1">
                <h3 className="font-semibold">{item.product.name}</h3>
                <p className="text-sm text-gray-500">{item.product.category}</p>
                <div className="flex items-center gap-4 mt-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1 hover:bg-gray-200 rounded">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-200 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded">
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
        </div>

        <aside className="bg-white rounded-lg shadow p-6">
  <h3 className="font-semibold text-lg mb-4">Adresse de livraison</h3>
  <form
    onSubmit={e => {
      e.preventDefault();
      handleCheckout();
    }}
    className="space-y-4"
  >
    {/* Nom complet */}
    <input
      type="text"
      className="w-full border rounded px-3 py-2"
      placeholder="Nom complet "
      value={fullname}
      onChange={e => setFullname(e.target.value)}
      required
    />

    {/* Adresse */}
    

    {/* Ville  */}
    <div className="flex gap-2">
      <select
        className="flex-1 border rounded px-3 py-2"
        value={city}
        onChange={e => setCity(e.target.value)}
        required
      >
        <option value="">Sélectionnez votre ville</option>
        <option value="Tanger">Tanger</option>
        <option value="Tetouan">Tétouan</option>
        <option value="Al Hoceima">Al Hoceima</option>
        <option value="Larache">Larache</option>
        <option value="Fahs-Anjra">Fahs-Anjra</option>
        <option value="Chefchaouen">Chefchaouen</option>
        <option value="M'diq">M'diq</option>
        <option value="Martil">Martil</option>
        <option value="Fnideq">Fnideq</option>
        {/* ajoute d'autres villes si nécessaire */}
      </select>
      
      
    </div>
    <input
      type="text"
      className="w-full border rounded px-3 py-2"
      placeholder="Adresse ex: hay..rue.."
      value={address}
      onChange={e => setAddress(e.target.value)}
      required
      />
    {/* Téléphone */}
    <input
      type="tel"
      className="w-full border rounded px-3 py-2"
      placeholder="Téléphone"
      value={phone}
      onChange={e => setPhone(e.target.value)}
      required
    />

    {/* Méthode de paiement */}
    <h3 className="font-semibold text-lg mt-4 mb-2">Méthode de paiement</h3>
    <div className="text-sm text-gray-700 mb-2">Paiement à la livraison uniquement</div>

    {/* Message d'erreur */}
    {error && <div className="text-sm text-red-600">{error}</div>}

    {/* Total et boutons */}
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold">Total</span>
        <span className="text-2xl font-bold text-blue-600">{total.toFixed(2)} DH</span>
      </div>

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className={`w-full py-3 rounded-lg font-semibold ${
          submitting ? 'bg-green-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {submitting ? 'Envoi en cours…' : 'Confirmer mes achats'}
      </button>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="w-full mt-2 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300"
      >
        Annuler
      </button>
    </div>
    </form>
  </aside>

      </div>
    </section>
  );
}
