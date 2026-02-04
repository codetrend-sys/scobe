import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import boutiqueData from '../components/data/data.js';

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données depuis Supabase ou fallback sur data.js
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier si Supabase est configuré
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project')) {
        // Fallback sur data.js si Supabase n'est pas configuré
        console.warn('⚠️ Supabase non configuré, utilisation de data.js local');
        setCategories(boutiqueData);
        setLoading(false);
        return;
      }

      // Charger depuis Supabase
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('id');

      if (categoriesError) throw categoriesError;

      // Charger les sous-catégories pour chaque catégorie
      const categoriesWithSubs = await Promise.all(
        categoriesData.map(async (category) => {
          const { data: subcategoriesData, error: subsError } = await supabase
            .from('subcategories')
            .select('*')
            .eq('category_id', category.id)
            .order('id');

          if (subsError) throw subsError;

          // Charger les produits pour chaque sous-catégorie
          const subcategoriesWithProducts = await Promise.all(
            (subcategoriesData || []).map(async (subcategory) => {
              const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('subcategory_id', subcategory.id)
                .order('id');

              if (productsError) throw productsError;

              return {
                ...subcategory,
                id: subcategory.id,
                name: subcategory.name,
                imageUrl: subcategory.image_url,
                products: (productsData || []).map((p) => ({
                  id: p.id,
                  name: p.name,
                  price: parseFloat(p.price),
                  rating: parseFloat(p.rating),
                  imageUrl: p.image_url,
                  featured: p.featured,
                  category_id: category.id,
                  category_name: category.name,
                })),
              };
            }),
          );

          return {
            ...category,
            id: category.id,
            name: category.name,
            imageUrl: category.image_url,
            description: category.description,
            subcategories: subcategoriesWithProducts,
          };
        }),
      );

      setCategories(categoriesWithSubs);
    } catch (err) {
      console.error('Erreur lors du chargement depuis Supabase:', err);
      setError(err.message);
      // Fallback sur data.js en cas d'erreur
      setCategories(boutiqueData);
    } finally {
      setLoading(false);
    }
  };

  // ---------- CRUD Catégories ----------
  const addCategory = async (category) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          image_url: category.imageUrl || null,
          description: category.description || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Recharger les catégories
      await loadCategories();
      return data;
    } catch (err) {
      console.error('Erreur lors de l\'ajout de catégorie:', err);
      throw err;
    }
  };

  const updateCategory = async (id, partial) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: partial.name,
          image_url: partial.imageUrl,
          description: partial.description,
        })
        .eq('id', id);

      if (error) throw error;
      await loadCategories();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de catégorie:', err);
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadCategories();
    } catch (err) {
      console.error('Erreur lors de la suppression de catégorie:', err);
      throw err;
    }
  };

  // ---------- CRUD Sous-catégories ----------
  const addSubcategory = async (categoryId, subcategory) => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .insert({
          category_id: categoryId,
          name: subcategory.name,
          image_url: subcategory.imageUrl || null,
        });

      if (error) throw error;
      await loadCategories();
    } catch (err) {
      console.error('Erreur lors de l\'ajout de sous-catégorie:', err);
      throw err;
    }
  };

  const updateSubcategory = async (categoryId, subId, partial) => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .update({
          name: partial.name,
          image_url: partial.imageUrl,
        })
        .eq('id', subId);

      if (error) throw error;
      await loadCategories();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de sous-catégorie:', err);
      throw err;
    }
  };

  const deleteSubcategory = async (categoryId, subId) => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subId);

      if (error) throw error;
      await loadCategories();
    } catch (err) {
      console.error('Erreur lors de la suppression de sous-catégorie:', err);
      throw err;
    }
  };

  // ---------- CRUD Produits ----------
  const addProduct = async (categoryId, subId, product) => {
    try {
      const { data: inserted, error } = await supabase
        .from('products')
        .insert({
          subcategory_id: subId,
          name: product.name,
          price: product.price || 0,
          rating: product.rating || 0,
          image_url: product.imageUrl || null,
          featured: product.featured || false,
        })
        .select()
        .single();

      if (error) throw error;

      // Si le produit est mis en vedette, l'ajouter dans featured_products
      if (inserted && inserted.featured) {
        const { error: fErr } = await supabase
          .from('featured_products')
          .insert({ product_id: inserted.id });
        if (fErr) console.warn("Impossible d'ajouter en featured_products:", fErr.message || fErr);
      }

      await loadCategories();
    } catch (err) {
      console.error('Erreur lors de l\'ajout de produit:', err);
      throw err;
    }
  };

  const updateProduct = async (categoryId, subId, productId, partial) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: partial.name,
          price: partial.price || 0,
          rating: partial.rating || 0,
          image_url: partial.imageUrl || null,
          featured: partial.featured || false,
        })
        .eq('id', productId);

      if (error) throw error;
      // Synchroniser la table featured_products
      try {
        if (partial.featured) {
          // insert if not exists
          const { data } = await supabase
            .from('featured_products')
            .select('*')
            .eq('product_id', productId)
            .limit(1);
          if (!data || data.length === 0) {
            await supabase.from('featured_products').insert({ product_id: productId });
          }
        } else {
          // remove from featured_products if exists
          await supabase.from('featured_products').delete().eq('product_id', productId);
        }
      } catch (syncErr) {
        console.warn('Erreur synchronisation featured_products:', syncErr);
      }

      await loadCategories();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de produit:', err);
      throw err;
    }
  };

  const deleteProduct = async (categoryId, subId, productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      // supprimer de featured_products si présent
      try {
        await supabase.from('featured_products').delete().eq('product_id', productId);
      } catch (syncErr) {
        console.warn('Erreur suppression featured_products:', syncErr);
      }

      await loadCategories();
    } catch (err) {
      console.error('Erreur lors de la suppression de produit:', err);
      throw err;
    }
  };

  const value = {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    addProduct,
    updateProduct,
    deleteProduct,
    refresh: loadCategories,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
