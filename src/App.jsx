import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Header } from './components/layouts/header'
import { Footer } from './components/layouts/footer';
import Home from './components/Acceuil/Home.jsx';
import CategoryCard from "./components/layers/CategoriesList.jsx";
import SousCategorieCard from "./components/layers/SousCategoriesList.jsx";
import Product from "./components/layers/Product.jsx";
import CartWrapper from './components/items/CartWrapper.jsx';
import Checkout from './components/pages/Checkout.jsx';
import OrderConfirmation from './components/pages/OrderConfirmation.jsx';
import Login from './components/pages/Login.jsx';
import Profile from './components/pages/Profile.jsx';
import SearchResults from './components/pages/SearchResults.jsx';
import CartPage from './components/pages/CartPage.jsx';
// import RequireAuth from './components/RequireAuth.jsx';
import ChatBot from './components/layers/ChatBot.jsx';
import Favorites from './components/pages/Favorites.jsx';
import Contact from './components/pages/Contact.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import RequireAdmin from './components/admin/RequireAdmin.jsx';
import ScrollToTop from './components/items/scrolltotop.jsx'


// import boutiqueData from './components/data/data.js';
function App() {
  return (
    <Router>
     <div className="min-h-screen bg-gray-50">
     <Header />
     <CartWrapper />
     <ChatBot/>
      <ScrollToTop/>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/search" element={<SearchResults/>} />
      <Route path="/categorie/:id" element={<SousCategorieCard />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />
      <Route path="/allcategories" element={<CategoryCard/>}/>
      <Route path="/souscategorie/:id" element={<Product />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/" element={<Home/>}/>
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin/login" element={<Navigate to="/espace-prive/login" replace />} />
      <Route path="/admin" element={<Navigate to="/espace-prive" replace />} />
      <Route path="/espace-prive/login" element={<AdminLogin />} />
      <Route
        path="/espace-prive"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />
      </Routes>
      
     
     <Footer/>
     </div>
    


    </Router>
  )
}

export default App
