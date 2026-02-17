/**
 * Admin Dashboard Amélioré avec Upload Images
 * Interface optimisée pour l'ajout, modification et upload d'images
 * Vérifie que les changements sont bien sauvegardés dans Supabase
 */

import { useState, useEffect } from 'react';
import { useCatalog } from '../../context/CatalogContext.jsx';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { supabase } from '../../lib/supabase.js';
import { Plus, Edit2, Trash2, X, Check, LogOut, AlertCircle, CheckCircle, Upload, Image as ImageIcon } from 'lucide-react';
import Orders from './Orders.jsx';

import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    addProduct,
    updateProduct,
    deleteProduct,
    refresh,
  } = useCatalog();
  const { logout } = useAdminAuth();

  // État des onglets
  const [activeTab, setActiveTab] = useState('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubId, setSelectedSubId] = useState(null);

  // État du formulaire unifié
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [editingItemId, setEditingItemId] = useState(null); // Pour l'édition inline
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  // Users list state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedSub = selectedCategory?.subcategories.find((s) => s.id === selectedSubId);

  // Gestion des messages
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const showError = (field, msg) => {
    setFormErrors(prev => ({ ...prev, [field]: msg }));
  };

  const clearErrors = () => setFormErrors({});

  // Gestion des images avec upload
  const handleImageUpload = async (file) => {
    if (!file) return;

    // Valider le fichier
    if (!file.type.startsWith('image/')) {
      showError('image', 'Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      showError('image', 'L\'image doit faire moins de 5MB');
      return;
    }

    // Afficher aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Uploader vers Supabase Storage
    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const path = `images/${activeTab}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('scobe-images')
        .upload(path, file);

      if (error) throw error;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('scobe-images')
        .getPublicUrl(path);

      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      clearErrors();
      showSuccess('✅ Image uploadée avec succès');
    } catch (err) {
      showError('image', `Erreur upload: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Validation des formulaires
  const validateForm = () => {
    clearErrors();
    let isValid = true;

    if (!formData.name?.trim()) {
      showError('name', 'Le nom est requis');
      isValid = false;
    }

    if (activeTab === 'products') {
      if (!formData.barcode?.trim()) {
        showError('barcode', 'Le code-barres est requis');
        isValid = false;
      }
      // reference is optional but limit length
      if (formData.reference && formData.reference.length > 100) {
        showError('reference', 'La référence ne doit pas dépasser 100 caractères');
        isValid = false;
      }
      if (!formData.price || formData.price <= 0) {
        showError('price', 'Le prix doit être supérieur à 0');
        isValid = false;
      }
      if (formData.rating && (formData.rating < 0 || formData.rating > 5)) {
        showError('rating', 'La note doit être entre 0 et 5');
        isValid = false;
      }
    }

    return isValid;
  };

  // Vérifier dans Supabase que la modification a été appliquée
  const verifyChangeInSupabase = async (entityType, entityId) => {
    setVerificationStatus('🔍 Vérification dans Supabase...');
    try {
      let data, error;

      if (entityType === 'category') {
        ({ data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', entityId)
          .single());
      } else if (entityType === 'subcategory') {
        ({ data, error } = await supabase
          .from('subcategories')
          .select('*')
          .eq('id', entityId)
          .single());
      } else if (entityType === 'product') {
        ({ data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', entityId)
          .single());
      }

      if (error) throw error;
      if (data) {
        setVerificationStatus('✅ Changement confirmé dans Supabase');
        setTimeout(() => setVerificationStatus(''), 3000);
        return true;
      }
    } catch (err) {
      setVerificationStatus(`❌ Erreur de vérification: ${err.message}`);
      setTimeout(() => setVerificationStatus(''), 4000);
      return false;
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({});
    setFormErrors({});
    setIsFormOpen(false);
    setIsEditing(false);
    setImagePreview('');
    setEditingItemId(null);
  };

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, phone, address')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Erreur fetch users:', err.message || err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load users when Users tab is active
  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  // ========== CATÉGORIES ==========
  const openAddCategoryForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
    });
    setImagePreview('');
    setIsEditing(false);
    setIsFormOpen(true);
    setEditingItemId(null);
  };

  const openEditCategoryForm = (category) => {
    setFormData(category);
    setImagePreview(category.imageUrl || '');
    setIsEditing(true);
    setIsFormOpen(true);
    setEditingItemId(category.id);
  };

  const handleSaveCategory = async () => {
    if (!validateForm()) return;
    try {
      if (isEditing) {
        await updateCategory(formData.id, {
          name: formData.name.trim(),
          description: formData.description || '',
          imageUrl: formData.imageUrl || '',
        });
        showSuccess('✅ Catégorie modifiée');
        await verifyChangeInSupabase('category', formData.id);
      } else {
        const result = await addCategory({
          name: formData.name.trim(),
          description: formData.description || '',
          imageUrl: formData.imageUrl || '',
        });
        showSuccess('✅ Catégorie ajoutée');
      }
      await refresh();
      resetForm();
    } catch (err) {
      showError('submit', `Erreur: ${err.message}`);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id);
      showSuccess('✅ Catégorie supprimée');
      await verifyChangeInSupabase('category', id);
      if (selectedCategoryId === id) setSelectedCategoryId(null);
      await refresh();
    } catch (err) {
      showError('submit', `Erreur: ${err.message}`);
    }
  };

  const openDeleteCategoryConfirm = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: '❌ Supprimer la catégorie',
      message: 'Êtes-vous sûr? Cela supprimera aussi toutes les sous-catégories et produits.',
      onConfirm: async () => { await handleDeleteCategory(id); }
    });
  };

  // ========== SOUS-CATÉGORIES ==========
  const openAddSubcategoryForm = () => {
    if (!selectedCategory) {
      showError('submit', 'Sélectionnez une catégorie d\'abord');
      return;
    }
    setFormData({
      name: '',
      imageUrl: '',
    });
    setImagePreview('');
    setIsEditing(false);
    setIsFormOpen(true);
    setEditingItemId(null);
  };

  const openEditSubcategoryForm = (sub) => {
    setFormData(sub);
    setImagePreview(sub.imageUrl || '');
    setIsEditing(true);
    setIsFormOpen(true);
    setEditingItemId(sub.id);
  };

  const handleSaveSubcategory = async () => {
    if (!validateForm()) return;
    if (!selectedCategory) return;
    try {
      if (isEditing) {
        await updateSubcategory(selectedCategory.id, formData.id, {
          name: formData.name.trim(),
          imageUrl: formData.imageUrl || '',
        });
        showSuccess('✅ Sous-catégorie modifiée');
        await verifyChangeInSupabase('subcategory', formData.id);
      } else {
        await addSubcategory(selectedCategory.id, {
          name: formData.name.trim(),
          imageUrl: formData.imageUrl || '',
        });
        showSuccess('✅ Sous-catégorie ajoutée');
      }
      await refresh();
      resetForm();
    } catch (err) {
      showError('submit', `Erreur: ${err.message}`);
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!selectedCategory) return;
    try {
      await deleteSubcategory(selectedCategory.id, id);
      showSuccess('✅ Sous-catégorie supprimée');
      await verifyChangeInSupabase('subcategory', id);
      if (selectedSubId === id) setSelectedSubId(null);
      await refresh();
    } catch (err) {
      showError('submit', `Erreur: ${err.message}`);
    }
  };

  const openDeleteSubcategoryConfirm = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: '❌ Supprimer la sous-catégorie',
      message: 'Êtes-vous sûr? Cela supprimera aussi tous les produits.',
      onConfirm: async () => { await handleDeleteSubcategory(id); }
    });
  };

  // ========== PRODUITS ==========
  const openAddProductForm = () => {
    if (!selectedCategory || !selectedSub) {
      showError('submit', 'Sélectionnez une catégorie et sous-catégorie');
      return;
    }
    setFormData({
      name: '',
      barcode: '',
      price: '',
      rating: 0,
      imageUrl: '',
      featured: false,
    });
    setImagePreview('');
    setIsEditing(false);
    setIsFormOpen(true);
    setEditingItemId(null);
  };

  const openEditProductForm = (product) => {
    setFormData(product);
    setImagePreview(product.imageUrl || '');
    setIsEditing(true);
    setIsFormOpen(true);
    setEditingItemId(product.id);
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) return;
    if (!selectedCategory || !selectedSub) return;
    try {
      if (isEditing) {
        await updateProduct(selectedCategory.id, selectedSub.id, formData.id, {
          name: formData.name.trim(),
          barcode: formData.barcode?.trim() || null,
          reference: formData.reference?.trim() || null,
          price: parseFloat(formData.price) || 0,
          rating: parseFloat(formData.rating) || 0,
          imageUrl: formData.imageUrl || '',
          featured: formData.featured || false,
        });
        showSuccess('✅ Produit modifié');
        await verifyChangeInSupabase('product', formData.id);
      } else {
        await addProduct(selectedCategory.id, selectedSub.id, {
          name: formData.name.trim(),
          barcode: formData.barcode?.trim() || null,
          reference: formData.reference?.trim() || null,
          price: parseFloat(formData.price) || 0,
          rating: parseFloat(formData.rating) || 0,
          imageUrl: formData.imageUrl || '',
          featured: formData.featured || false,
        });
        showSuccess('✅ Produit ajouté');
      }
      await refresh();
      resetForm();
    } catch (err) {
      showError('submit', `Erreur: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!selectedCategory || !selectedSub) return;
    try {
      await deleteProduct(selectedCategory.id, selectedSub.id, id);
      showSuccess('✅ Produit supprimé');
      await verifyChangeInSupabase('product', id);
      await refresh();
    } catch (err) {
      showError('submit', `Erreur: ${err.message}`);
    }
  };

  const openDeleteProductConfirm = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: '❌ Supprimer le produit',
      message: 'Êtes-vous sûr?',
      onConfirm: async () => { await handleDeleteProduct(id); }
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.onConfirm) await confirmDialog.onConfirm();
    closeConfirmDialog();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800 mb-4">⏳ Chargement...</div>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Confirmation Modal (réutilisable) */}
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
              <button onClick={closeConfirmDialog} className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition font-semibold">Annuler</button>
              <button onClick={handleConfirmAction} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold flex items-center gap-2"> 
                <Trash2 size={18} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎛️ Gestion Boutique</h1>
            <p className="text-gray-600 mt-1">Gérez vos catégories, sous-catégories et produits</p>
          </div>
          <button
              onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-medium"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {verificationStatus && (
          <div className={`mb-6 rounded-lg p-4 flex items-center gap-3 ${
            verificationStatus.includes('✅')
              ? 'bg-green-50 border border-green-200'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <span className={verificationStatus.includes('✅') ? 'text-green-800' : 'text-blue-800'}>
              {verificationStatus}
            </span>
          </div>
        )}

        {formErrors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-800 font-medium">{formErrors.submit}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-1 flex flex-wrap gap-1">
          <button
            onClick={() => { setActiveTab('categories'); resetForm(); setSelectedCategoryId(null); }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition order-1 ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            📁 Catégories
          </button>
          <button
            onClick={() => { setActiveTab('users'); resetForm(); }}
            className={`w-full sm:flex-1 py-3 px-4 rounded-lg font-medium transition order-6 sm:order-5 ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            👥 Utilisateurs
          </button>
          <button
            onClick={() => { setActiveTab('subcategories'); resetForm(); }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition order-3 sm:order-2 ${
              activeTab === 'subcategories'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            📂 Sous-catégories
          </button>
          <button
            onClick={() => { setActiveTab('products'); resetForm(); }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition order-4 sm:order-3 ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            📦 Produits
          </button>
          <button
            onClick={() => { setActiveTab('orders'); resetForm(); }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition order-5 sm:order-4 ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            🧾 Commandes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Formulaire Global - pour Ajouter seulement */}
            {isFormOpen && editingItemId === null && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isEditing ? '✏️ Modifier' : '➕ Ajouter'} {
                      activeTab === 'categories' ? 'Catégorie' :
                      activeTab === 'subcategories' ? 'Sous-catégorie' : 'Produit'
                    }
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Champ Nom */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={
                        activeTab === 'categories' ? 'Ex: Papeterie' :
                        activeTab === 'subcategories' ? 'Ex: Cahiers' : 'Ex: Cahier A4 100 feuilles'
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.name}</p>
                    )}
                  </div>

                  {/* Description (Catégories uniquement) */}
                  {activeTab === 'categories' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Décrivez cette catégorie..."
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Upload Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Image {activeTab === 'categories' ? '' : '*'}
                    </label>
                    
                    {/* Aperçu Image */}
                    {imagePreview && (
                      <div className="mb-4 relative">
                        <img 
                          src={imagePreview} 
                          alt="Aperçu" 
                          className="w-full h-40 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={() => {
                            setImagePreview('');
                            setFormData({ ...formData, imageUrl: '' });
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                          title="Supprimer l'image"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}

                    {/* File Input */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files?.[0])}
                        disabled={isUploading}
                        className="hidden"
                        id={`image-upload-${activeTab}`}
                      />
                      <label
                        htmlFor={`image-upload-${activeTab}`}
                        className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition ${
                          isUploading
                            ? 'border-gray-300 bg-gray-100'
                            : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
                        } ${formErrors.image ? 'border-red-500 bg-red-50' : ''}`}
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin">⏳</div>
                            <span>Upload en cours...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={20} className="text-blue-600" />
                            <span className="text-gray-700">
                              Cliquez pour sélectionner une image
                            </span>
                          </>
                        )}
                      </label>
                      {formErrors.image && (
                        <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.image}</p>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      📌 Max 5MB • JPG, PNG, WebP acceptés
                    </p>
                  </div>

                  {/* Prix et Note (Produits) */}
                  {activeTab === 'products' && (
                    <>
                      {/* Code-barres */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Code-barres <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.barcode || ''}
                          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                          placeholder="Ex : 1234567890123"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formErrors.barcode ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.barcode && (
                          <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.barcode}</p>
                        )}
                      </div>

                      {/* Référence produit */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Référence
                        </label>
                        <input
                          type="text"
                          value={formData.reference || ''}
                          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                          placeholder="Ex : NAVIGATOR-A3"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formErrors.reference ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.reference && (
                          <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.reference}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Prix (DH) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={formData.price || ''}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="0.00"
                            step="0.01"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              formErrors.price ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {formErrors.price && (
                            <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.price}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Note (0-5)
                          </label>
                          <input
                            type="number"
                            value={formData.rating || 0}
                            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                            placeholder="0"
                            min="0"
                            max="5"
                            step="0.5"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              formErrors.rating ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {formErrors.rating && (
                            <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.rating}</p>
                          )}
                        </div>
                      </div>

                      {/* Checkbox Vedette */}
                      <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                        <input
                          type="checkbox"
                          checked={formData.featured || false}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <span className="text-gray-800 font-medium">📌 Produit en vedette</span>
                      </label>
                    </>
                  )}

                  {/* Boutons Action */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={
                        activeTab === 'categories' ? handleSaveCategory :
                        activeTab === 'subcategories' ? handleSaveSubcategory :
                        handleSaveProduct
                      }
                      disabled={isUploading}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition font-semibold"
                    >
                      <Check size={20} />
                      {isEditing ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                    <button
                      onClick={resetForm}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition font-semibold"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton pour ouvrir formulaire (caché sur les onglets Utilisateurs et Commandes) */}
            {!isFormOpen && activeTab !== 'users' && activeTab !== 'orders' && (
              <button
                onClick={
                  activeTab === 'categories' ? openAddCategoryForm :
                  activeTab === 'subcategories' ? openAddSubcategoryForm :
                  openAddProductForm
                }
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg mb-6 transition font-semibold flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Ajouter {
                  activeTab === 'categories' ? 'une catégorie' :
                  activeTab === 'subcategories' ? 'une sous-catégorie' : 'un produit'
                }
              </button>
            )}

            {/* Liste des Catégories */}
            {activeTab === 'categories' && (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    {/* Formulaire inline si en édition */}
                    {editingItemId === cat.id && isFormOpen && (
                      <div className="bg-white rounded-lg shadow-md p-6 mb-3 border-l-4 border-blue-500">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-gray-900">✏️ Modifier Catégorie</h2>
                          <button
                            onClick={resetForm}
                            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded"
                          >
                            <X size={24} />
                          </button>
                        </div>

                        <div className="space-y-5">
                          {/* Champ Nom */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nom <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.name || ''}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Nom de la catégorie"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                formErrors.name ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {formErrors.name && (
                              <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.name}</p>
                            )}
                          </div>

                          {/* Champ Description */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Description
                            </label>
                            <textarea
                              value={formData.description || ''}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              placeholder="Description de la catégorie"
                              rows="3"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Upload Image */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Image
                            </label>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                                  disabled={isUploading}
                                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {isUploading && <p className="text-blue-600 text-sm mt-2">📤 Upload en cours...</p>}
                              </div>
                              {imagePreview && (
                                <img 
                                  src={imagePreview} 
                                  alt="Aperçu"
                                  className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                                />
                              )}
                            </div>
                            {formErrors.image && (
                              <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.image}</p>
                            )}
                          </div>

                          {/* Boutons Action */}
                          <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                              onClick={handleSaveCategory}
                              disabled={isUploading}
                              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition font-semibold"
                            >
                              <Check size={20} />
                              Mettre à jour
                            </button>
                            <button
                              onClick={resetForm}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition font-semibold"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Item */}
                    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition border-l-4 border-blue-500 flex gap-4">
                      {cat.imageUrl && (
                        <img 
                          src={cat.imageUrl} 
                          alt={cat.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{cat.name}</h3>
                        {cat.description && (
                          <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          🎯 {cat.subcategories?.length || 0} sous-catégories
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openEditCategoryForm(cat)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteCategoryConfirm(cat.id)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Liste des Sous-Catégories */}
            {activeTab === 'subcategories' && selectedCategory && (
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-gray-600">
                    📂 Sous-catégories de <span className="font-bold text-blue-600">{selectedCategory.name}</span>
                  </p>
                </div>
                {selectedCategory.subcategories?.map((sub) => (
                  <div key={sub.id}>
                    {/* Formulaire inline si en édition */}
                    {editingItemId === sub.id && isFormOpen && (
                      <div className="bg-white rounded-lg shadow-md p-6 mb-3 border-l-4 border-green-500">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-gray-900">✏️ Modifier Sous-catégorie</h2>
                          <button
                            onClick={resetForm}
                            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded"
                          >
                            <X size={24} />
                          </button>
                        </div>

                        <div className="space-y-5">
                          {/* Champ Nom */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nom <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.name || ''}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Nom de la sous-catégorie"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                formErrors.name ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {formErrors.name && (
                              <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.name}</p>
                            )}
                          </div>

                          {/* Upload Image */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Image
                            </label>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                                  disabled={isUploading}
                                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                />
                                {isUploading && <p className="text-green-600 text-sm mt-2">📤 Upload en cours...</p>}
                              </div>
                              {imagePreview && (
                                <img 
                                  src={imagePreview} 
                                  alt="Aperçu"
                                  className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                                />
                              )}
                            </div>
                            {formErrors.image && (
                              <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.image}</p>
                            )}
                          </div>

                          {/* Boutons Action */}
                          <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                              onClick={handleSaveSubcategory}
                              disabled={isUploading}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition font-semibold"
                            >
                              <Check size={20} />
                              Mettre à jour
                            </button>
                            <button
                              onClick={resetForm}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition font-semibold"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Item */}
                    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition border-l-4 border-green-500 flex gap-4">
                      {sub.imageUrl && (
                        <img 
                          src={sub.imageUrl} 
                          alt={sub.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{sub.name}</h3>
                        <p className="text-xs text-gray-500 mt-2">
                          📦 {sub.products?.length || 0} produits
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openEditSubcategoryForm(sub)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteSubcategoryConfirm(sub.id)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Liste des Produits */}
            {activeTab === 'products' && selectedCategory && selectedSub && (
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-gray-600">
                    📦 Produits de <span className="font-bold text-blue-600">{selectedSub.name}</span>
                  </p>
                </div>
                {selectedSub.products?.map((product) => (
                  <div key={product.id}>
                    {/* Formulaire inline si en édition */}
                    {editingItemId === product.id && isFormOpen && (
                      <div className="bg-white rounded-lg shadow-md p-6 mb-3 border-l-4 border-purple-500">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-gray-900">✏️ Modifier Produit</h2>
                          <button
                            onClick={resetForm}
                            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded"
                          >
                            <X size={24} />
                          </button>
                        </div>

                        <div className="space-y-5">
                          {/* Champ Nom */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nom <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.name || ''}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Nom du produit"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                formErrors.name ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {formErrors.name && (
                              <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.name}</p>
                            )}
                          </div>

                          {/* Code-barres */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Code-barres <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.barcode || ''}
                              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                              placeholder="Ex : 1234567890123"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                formErrors.barcode ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {formErrors.barcode && (
                              <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.barcode}</p>
                            )}
                          </div>

                          {/* Référence */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Référence
                            </label>
                            <input
                              type="text"
                              value={formData.reference || ''}
                              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                              placeholder="Ex : NAVIGATOR-A3"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                formErrors.reference ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {formErrors.reference && (
                              <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.reference}</p>
                            )}
                          </div>

                          {/* Prix et Note */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Prix (DH) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                value={formData.price || ''}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                step="0.01"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                  formErrors.price ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {formErrors.price && (
                                <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.price}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Note (0-5)
                              </label>
                              <input
                                type="number"
                                value={formData.rating || 0}
                                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                placeholder="0"
                                min="0"
                                max="5"
                                step="0.5"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                  formErrors.rating ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {formErrors.rating && (
                                <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.rating}</p>
                              )}
                            </div>
                          </div>

                          {/* Checkbox Vedette */}
                          <label className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition">
                            <input
                              type="checkbox"
                              checked={formData.featured || false}
                              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                              className="w-5 h-5 text-purple-600 rounded"
                            />
                            <span className="text-gray-800 font-medium">📌 Produit en vedette</span>
                          </label>

                          {/* Upload Image */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Image
                            </label>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                                  disabled={isUploading}
                                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                                {isUploading && <p className="text-purple-600 text-sm mt-2">📤 Upload en cours...</p>}
                              </div>
                              {imagePreview && (
                                <img 
                                  src={imagePreview} 
                                  alt="Aperçu"
                                  className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                                />
                              )}
                            </div>
                            {formErrors.image && (
                              <p className="text-red-600 text-sm mt-1">⚠️ {formErrors.image}</p>
                            )}
                          </div>

                          {/* Boutons Action */}
                          <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                              onClick={handleSaveProduct}
                              disabled={isUploading}
                              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition font-semibold"
                            >
                              <Check size={20} />
                              Mettre à jour
                            </button>
                            <button
                              onClick={resetForm}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition font-semibold"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Item */}
                    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition border-l-4 border-purple-500 flex gap-4">
                      {product.imageUrl && (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                          {product.featured && <span className="text-lg">📌</span>}
                        </div>
                        {product.reference && (
                          <p className="text-xs text-gray-500">Réf: {product.reference}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          💰 {product.price} DH • ⭐ {product.rating || 0}/5
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openEditProductForm(product)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteProductConfirm(product.id)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Liste des utilisateurs */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow-md p-3 lg:p-6 mb-6 w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                  <h2 className="text-lg lg:text-xl font-bold">Liste des utilisateurs</h2>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="border rounded px-2 lg:px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => fetchUsers()}
                      className="bg-blue-600 text-white px-2 lg:px-3 py-2 rounded text-sm whitespace-nowrap"
                    >Refresh</button>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="text-sm">Chargement des utilisateurs…</div>
                ) : (
                  <div className="overflow-x-auto -mx-3 lg:mx-0">
                    <div className="px-3 lg:px-0">
                      <table className="w-full text-left text-xs lg:text-sm min-w-max lg:min-w-full">
                      <thead>
                        <tr className="text-xs text-gray-600 border-b">
                          <th className="py-2 px-2">Nom</th>
                          <th className="py-2 px-2">Email</th>
                          <th className="py-2 px-2 hidden sm:table-cell">Téléphone</th>
                          <th className="py-2 px-2 hidden md:table-cell">Adresse</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter(u => {
                            if (!userSearch) return true;
                            const q = userSearch.toLowerCase();
                            return (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
                          })
                          .map((u) => (
                          <tr key={u.id} className="border-b text-xs sm:text-sm">
                            <td className="py-3 px-2">{u.full_name || '—'}</td>
                            <td className="py-3 px-2 truncate">{u.email}</td>
                            <td className="py-3 px-2 hidden sm:table-cell">{u.phone || '—'}</td>
                            <td className="py-3 px-2 hidden md:table-cell">{u.address || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Liste des Commandes */}
            {activeTab === 'orders' && (
              <div className="space-y-3">
                <Orders />
              </div>
            )}
          </div>

          {/* Sidebar - Sélection */}
          <div className="lg:col-span-1">
            {/* Sélection Catégorie */}
            {(activeTab === 'subcategories' || activeTab === 'products') && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-4 sticky top-4">
                <h3 className="font-bold text-gray-900 mb-3">📁 Sélectionnez une catégorie</h3>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        if (activeTab === 'products') setSelectedSubId(null);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${
                        selectedCategoryId === cat.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sélection Sous-Catégorie (Produits) */}
            {activeTab === 'products' && selectedCategory && (
              <div className="bg-white rounded-lg shadow-md p-4 sticky top-40">
                <h3 className="font-bold text-gray-900 mb-3">📂 Sélectionnez une sous-catégorie</h3>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {selectedCategory.subcategories?.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubId(sub.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${
                        selectedSubId === sub.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
