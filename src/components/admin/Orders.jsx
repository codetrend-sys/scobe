import { useEffect, useState } from 'react';
import { useAlert } from '../common/AlertProvider.jsx';
import { supabase } from '../../lib/supabase';
import { Trash2, RefreshCw, X } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // Filter by status
  const [deleting, setDeleting] = useState(null); // Track which order is being deleted
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });
  const alert = useAlert();

  // Statut colors mapping
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    processing: 'bg-blue-100 text-blue-800 border-blue-300',
    shipped: 'bg-purple-100 text-purple-800 border-purple-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };

  const statusBadges = {
    pending: '⏳ En attente',
    processing: '🔄 En cours',
    shipped: '📦 Expédiée',
    delivered: '✅ Livrée',
    cancelled: '❌ Annulée',
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Erreur fetch commandes', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Filtered orders based on status filter
  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => (o.status || 'pending') === statusFilter);

  // Delete single order
  const openDeleteConfirm = (id) => {
    const order = orders.find(o => o.id === id);
    setConfirmDialog({
      isOpen: true,
      title: '❌ Supprimer la commande',
      message: `Êtes-vous sûr de vouloir supprimer la commande #${order?.order_id?.slice(-6) || id}?`,
      onConfirm: () => performDeleteOrder(id),
    });
  };

  // Perform single order deletion
  const performDeleteOrder = async (id) => {
    setDeleting(id);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Erreur suppression:', error);
        throw error;
      }
      console.info('Commande supprimée avec succès');
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error('Erreur suppression commande', err);
      alert.showError(`Erreur lors de la suppression: ${err.message || err}`);
    } finally {
      setDeleting(null);
    }
  };

  // Delete all orders
  const openClearAllConfirm = () => {
    setConfirmDialog({
      isOpen: true,
      title: '❌ Supprimer toutes les commandes',
      message: 'Êtes-vous sûr de vouloir supprimer TOUTES les commandes ? Cette action est irréversible.',
      onConfirm: performClearAllOrders,
    });
  };

  // Perform delete all orders
  const performClearAllOrders = async () => {
    setDeleting('all');
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .neq('id', 0); // Delete all rows
      if (error) {
        console.error('Erreur suppression masse:', error);
        throw error;
      }
      console.info('Toutes les commandes supprimées');
      setOrders([]);
    } catch (err) {
      console.error('Erreur suppression masse', err);
      alert.showError(`Erreur lors de la suppression: ${err.message || err}`);
    } finally {
      setDeleting(null);
    }
  };

  // Update order status
  const updateStatus = async (id, newStatus) => {
    const oldStatus = orders.find(o => o.id === id)?.status;
    setUpdating(id);
    // Optimistic UI
    setOrders(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) {
        console.error('Erreur mise à jour statut:', error);
        throw error;
      }
      console.info('Statut mis à jour avec succès');
    } catch (err) {
      console.error('Erreur mise à jour statut', err);
      // Revert on error
      setOrders(prev => prev.map(p => p.id === id ? { ...p, status: oldStatus } : p));
      alert.showError(`Erreur lors de la mise à jour du statut: ${err.message || err}`);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="p-6 bg-white rounded shadow">Chargement des commandes…</div>;

  // Fonctions du modal
  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
    });
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.onConfirm) {
      await confirmDialog.onConfirm();
    }
    closeConfirmDialog();
  };

  return (
    <div className="space-y-4">
      {/* Modal de Confirmation */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <h2 className="text-xl font-bold text-red-700">{confirmDialog.title}</h2>
            </div>
            
            <div className="px-6 py-6">
              <p className="text-gray-700 text-lg">{confirmDialog.message}</p>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={closeConfirmDialog}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold flex items-center gap-2"
              >
                <Trash2 size={18} />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header avec actions */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">📋 Commandes ({filteredOrders.length})</h3>
          <div className="flex gap-2">
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              <RefreshCw size={18} />
              Rafraîchir
            </button>
            {orders.length > 0 && (
              <button
                onClick={openClearAllConfirm}
                disabled={deleting === 'all'}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition"
              >
                <Trash2 size={18} />
                Vider tout
              </button>
            )}
          </div>
        </div>

        {/* Filtre par statut */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Tous ({orders.length})
          </button>
          {Object.entries(statusBadges).map(([key, label]) => {
            const count = orders.filter(o => (o.status || 'pending') === key).length;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition border ${
                  statusFilter === key
                    ? statusColors[key] + ' border-current'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Message vide */}
      {filteredOrders.length === 0 && (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">
            {statusFilter === 'all' ? 'Aucune commande trouvée' : `Aucune commande ${statusBadges[statusFilter]?.toLowerCase()}`}
          </p>
        </div>
      )}

      {/* Liste des commandes */}
      <div className="space-y-3">
        {filteredOrders.map(o => (
          <div key={o.id} className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 overflow-hidden hover:shadow-md transition">
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                {/* Infos commande */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-bold text-lg">#{o.order_id?.slice(-6) || o.id}</div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[o.status || 'pending']}`}>
                      {statusBadges[o.status || 'pending']}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    🕐 {new Date(o.created_at).toLocaleString('fr-FR')}
                  </div>

                  {/* Infos client */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <div className="font-semibold text-gray-900">{o.shipping?.fullname}</div>
                    <div className="text-sm text-gray-600">📞 {o.shipping?.phone}</div>
                    <div className="text-sm text-gray-600">📍 {o.shipping?.city}</div>
                    {o.shipping?.address && (
                      <div className="text-sm text-gray-600">🏠 {o.shipping.address}</div>
                    )}
                  </div>

                  {/* Produits */}
                  <div className="text-sm text-gray-700">
                    <div className="font-semibold mb-2">Produits commandés:</div>
                    {Array.isArray(o.items) ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {o.items.map((it, i) => (
                          <li key={i} className="text-gray-700">
                            {it.name}{it.barcode ? ` (code-barres: ${it.barcode})` : ''} <span className="font-semibold">x{it.quantity}</span> — <span className="font-bold">{(it.price * it.quantity).toFixed(2)} DH</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">{JSON.stringify(o.items)}</pre>
                    )}
                  </div>
                </div>

                {/* Colonne actions */}
                <div className="flex-shrink-0 w-56 space-y-3">
                  {/* Total */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-xs text-gray-600">Total</div>
                    <div className="font-bold text-2xl text-blue-600">{Number(o.total || 0).toFixed(2)} DH</div>
                  </div>

                  {/* Changement statut */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Changer le statut</label>
                    <select
                      value={o.status || 'pending'}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      disabled={updating === o.id}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="pending">⏳ En attente</option>
                      <option value="processing">🔄 En cours</option>
                      <option value="shipped">📦 Expédiée</option>
                      <option value="delivered">✅ Livrée</option>
                      <option value="cancelled">❌ Annulée</option>
                    </select>
                    {updating === o.id && (
                      <div className="text-xs text-blue-600 mt-1">Mise à jour...</div>
                    )}
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    onClick={() => openDeleteConfirm(o.id)}
                    disabled={deleting === o.id}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition font-medium text-sm"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
