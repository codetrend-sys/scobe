import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import { CatalogProvider } from './context/CatalogContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminAuthProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <CatalogProvider>
              <App />
            </CatalogProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </AdminAuthProvider>
  </StrictMode>,
)
