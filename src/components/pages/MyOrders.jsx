import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUserAuth } from '../../context/UserAuthContext';
import { Package, Clock, Truck, XCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import StatusModal from '../common/StatusModal';
import { useAlert } from '../common/AlertProvider';

export default function MyOrders() {
  const { user, isAuthenticated } = useUserAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });
  const alert = useAlert();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des commandes:', err);
      setError('Impossible de charger vos commandes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('order_id', orderId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Mettre à jour localement
      setOrders(orders.map(order => 
        order.order_id === orderId ? { ...order, status: 'cancelled' } : order
      ));
      
      alert.showSuccess('Commande annulée avec succès.');
    } catch (err) {
      console.error('Erreur lors de l\'annulation:', err);
      alert.showError('Une erreur est survenue lors de l\'annulation de la commande.');
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'En attente', 
          icon: <Clock className="w-4 h-4" />, 
          color: 'bg-amber-100 text-amber-700',
          canCancel: true 
        };
      case 'shipped':
        return { 
          label: 'Expédiée', 
          icon: <Truck className="w-4 h-4" />, 
          color: 'bg-blue-100 text-blue-700',
          canCancel: false 
        };
      case 'delivered':
        return { 
          label: 'Livrée', 
          icon: <Package className="w-4 h-4" />, 
          color: 'bg-green-100 text-green-700',
          canCancel: false 
        };
      case 'cancelled':
        return { 
          label: 'Annulée', 
          icon: <XCircle className="w-4 h-4" />, 
          color: 'bg-red-100 text-red-700',
          canCancel: false 
        };
      default:
        return { 
          label: status, 
          icon: <AlertCircle className="w-4 h-4" />, 
          color: 'bg-gray-100 text-gray-700',
          canCancel: false 
        };
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Connectez-vous pour voir vos commandes</h2>
        <NavLink to="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
          Se connecter
        </NavLink>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-12 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mes Commandes</h1>
          <p className="text-gray-500">Suivez l'état de vos achats en temps réel</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl font-bold text-sm">
          {orders.length} Commande{orders.length > 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">Aucune commande trouvée</h2>
            <p className="text-gray-500 max-w-sm mx-auto">Vous n'avez pas encore passé de commande sur notre boutique.</p>
          </div>
          <NavLink to="/" className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors">
            Commencer mes achats
          </NavLink>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Commande #{order.order_id.slice(-8)}</p>
                        <p className="text-sm font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </div>
                      {statusInfo.canCancel && (
                        <button
                          onClick={() => setCancelModal({ isOpen: true, orderId: order.order_id })}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-50 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Articles</p>
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600"><span className="font-bold text-gray-900">{item.quantity}x</span> {item.name}</span>
                              <span className="font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} DH</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50/50 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total payé</p>
                          <p className="text-xl font-black text-blue-600">{order.total.toFixed(2)} DH</p>
                        </div>
                        <div className="pt-4 border-t border-gray-200/50">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Livraison à</p>
                          <p className="text-xs font-bold text-gray-700">{order.shipping.fullname}</p>
                          <p className="text-xs text-gray-500">{order.shipping.address}, {order.shipping.city}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmation d'annulation */}
      <StatusModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, orderId: null })}
        onConfirm={() => handleCancelOrder(cancelModal.orderId)}
        title="Annuler la commande ?"
        message="Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible."
        type="danger"
        confirmText="Oui, annuler"
        cancelText="Non, garder"
      />
    </section>
  );
}
