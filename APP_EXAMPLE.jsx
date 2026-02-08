import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CartProvider } from './context/CartContext';
import { CatalogProvider } from './context/CatalogContext';

import RequireAuth from './components/RequireAuth';
import RequireUserAuth from './components/RequireUserAuth';

// Pages publiques
import Home from './components/Acceuil/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Pages d'authentification utilisateur
import Login from './components/pages/Login';
import SignUp from './components/pages/SignUp';
import ChangePassword from './components/pages/ChangePassword';

// Pages protégées utilisateur
import Favorites from './components/pages/Favorites';

// Pages admin
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';

export default function App() {
  return (
    <Router>
      <CatalogProvider>
        <AdminAuthProvider>
          <UserAuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <Routes>
                  {/* ========== Routes Publiques ========== */}
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />

                  {/* ========== Routes Authentification Utilisateur ========== */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />

                  {/* ========== Routes Protégées Utilisateur ========== */}
                  <Route
                    path="/favoris"
                    element={
                      <RequireUserAuth>
                        <Favorites />
                      </RequireUserAuth>
                    }
                  />
                  <Route
                    path="/change-password"
                    element={
                      <RequireUserAuth>
                        <ChangePassword />
                      </RequireUserAuth>
                    }
                  />

                  {/* ========== Routes Admin ========== */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <RequireAuth>
                        <AdminDashboard />
                      </RequireAuth>
                    }
                  />
                </Routes>
              </FavoritesProvider>
            </CartProvider>
          </UserAuthProvider>
        </AdminAuthProvider>
      </CatalogProvider>
    </Router>
  );
}
