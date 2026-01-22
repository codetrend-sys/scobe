import { createContext, useContext, useState } from "react";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Toggle favori
  const toggleFavorite = (product) => {
    if (favorites.some(p => p.id === product.id)) {
      setFavorites(favorites.filter(p => p.id !== product.id));
    } else {
      setFavorites([...favorites, product]);
    }
  };

  // Retirer un favori
  const removeFavorite = (productId) => {
    setFavorites(favorites.filter(p => p.id !== productId));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
