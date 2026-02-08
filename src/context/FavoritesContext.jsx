/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import { useUserAuth } from "./UserAuthContext.jsx";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated, user } = useUserAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les favoris depuis Supabase quand l'utilisateur se connecte
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Récupérer les favoris de l'utilisateur
  const fetchFavorites = async () => {
    if (!isAuthenticated || !user) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setFavorites(data || []);
    } catch (err) {
      console.error("Erreur récupération favoris:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un favori
  const addFavorite = async (product) => {
    if (!isAuthenticated || !user) {
      setError("Veuillez vous connecter pour ajouter des favoris");
      return { ok: false, error: "Non authentifié" };
    }

    try {
      setError(null);
      const { data, error: insertError } = await supabase
        .from("favorites")
        .insert([
          {
            user_id: user.id,
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
            product_image_url: product.imageUrl,
            category: product.category,
            rating: product.rating || 0,
          },
        ])
        .select();

      if (insertError) throw insertError;

      setFavorites((prev) => [...(prev || []), data[0]]);
      return { ok: true };
    } catch (err) {
      console.error("Erreur ajout favori:", err);
      setError(err.message);
      return { ok: false, error: err.message };
    }
  };

  // Retirer un favori
  const removeFavorite = async (productId) => {
    if (!isAuthenticated || !user) {
      return { ok: false, error: "Non authentifié" };
    }

    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (deleteError) throw deleteError;

      // Use string comparison to avoid type mismatches
      setFavorites((prev) => (prev || []).filter((fav) => String(fav.product_id) !== String(productId)));
      return { ok: true };
    } catch (err) {
      console.error("Erreur suppression favori:", err);
      setError(err.message);
      return { ok: false, error: err.message };
    }
  };

  // Toggle favori (ajouter ou retirer)
  const toggleFavorite = async (product) => {
    if (!isAuthenticated || !user) {
      setError("Veuillez vous connecter pour gérer les favoris");
      return { ok: false, error: "Non authentifié" };
    }

    // Use string comparison to avoid type mismatches between DB and product id
    const isFav = (favorites || []).some((fav) => String(fav.product_id) === String(product.id));

    if (isFav) {
      return await removeFavorite(product.id);
    } else {
      return await addFavorite(product);
    }
  };

  // Vérifier si un produit est favori
  const isFavorite = (productId) => {
    return (favorites || []).some((fav) => String(fav.product_id) === String(productId));
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        error,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
};
