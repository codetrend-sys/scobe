import { Search, ShoppingCart, User, Menu, Heart } from 'lucide-react';
import logo from '../../images/logo.png'
import { SearchBar } from '../items/SearchBar.jsx';
import { CategoriesDropdown } from '../items/DropDown.jsx';
import { MobileMenu } from '../items/Menu.jsx';
import { NavLink } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
// import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { useUserAuth } from '../../context/UserAuthContext.jsx';

export function Header() {
  const { cartItems, setOpen } = useCart();
  // const { user } = useAuth();
  // const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { isAdminAuthenticated } = useAdminAuth();
  const { isAuthenticated } = useUserAuth();
  const favoritesCount = favorites.length;

  // Show number of distinct products (length) instead of total quantity
  const cartCount = cartItems.length;
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/25 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6  lg:px-8 lg:ml-20 mr-10">
          <div className="flex items-center justify-between h-28">
          <div className="flex lg:hidden items-center">
            {/* menu mobile */}
            <MobileMenu/>
          </div>

          <div className="flex-1 flex items-center justify-center lg:justify-start lg:ml-0 lg:gap-6">
            {/* logo */}
            <NavLink to={`/`}>
            <div className=" flex items-center justify-center ">
                <img src={logo} alt="" className='w-17 h-20 mb-2 ' />   
            </div>
            </NavLink>

            {/* navigation */}
            <nav className="hidden lg:flex items-center gap-6 ml-10">
              <NavLink to={`/`}>
              <p  className="text-gray-700 hover:text-blue-900 transition-colors font-medium text-lg">
                Accueil
              </p>
              </NavLink>
              {!isAdminAuthenticated && (
                <NavLink to="/favorites" className="relative text-gray-700 p-2 font-medium hover:text-blue-900 text-lg rounded-full transition-colors flex items-center gap-2">
                  Mes Favoris <Heart className="w-6 h-6 text-red-500" /> 
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {favoritesCount}
                    </span>
                  )}
                </NavLink>
              )}
              {/* <a href="#" className="text-gray-700 hover:text-blue-900 transition-colors font-medium">
                Catégories
              </a> */}
              <CategoriesDropdown/>

              <NavLink to={`/contact`}>
                <p className="text-gray-700 hover:text-blue-900 transition-colors font-medium text-lg">
                  Contact
                </p>
              </NavLink>
              <NavLink to={isAdminAuthenticated ? "/espace-prive" : (isAuthenticated ? "/profile" : "/login")}>
                <p className="text-gray-700 hover:text-blue-900 transition-colors font-medium text-lg">
                  {isAdminAuthenticated ? "Espace Admin" : (isAuthenticated ? "Mon Profil" : "Se connecter")}
                </p>
              </NavLink>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">

           {/* search */}
            <SearchBar/>

            {/* panier */}
            <button onClick={() => setOpen(true)} className="relative p-2 hover:bg-gray-200 rounded-full transition-colors">
              <ShoppingCart className="w-6 h-6 text-green-600" />
              <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            </button>

            {/* account */}
            {/* <button
              onClick={() => navigate(user ? '/profile' : '/login')}
              aria-label={user ? 'Voir le profil' : 'Se connecter'}
              title={user ? 'Mon profil' : 'Se connecter'}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <User className="w-6 h-6 text-green-600" />
            </button> */}
          </div>
        </div>
        </div>
      </header>
      {/* spacer to prevent content being hidden under fixed header */}
      <div className="h-28" aria-hidden="true" />
    </>
  );
}
