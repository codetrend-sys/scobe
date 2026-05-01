import { Search, ShoppingCart, User, Menu, Heart } from 'lucide-react';
import logo from '../../images/logo.png'
import { SearchBar } from '../items/SearchBar.jsx';
import { CategoriesDropdown } from '../items/DropDown.jsx';
import { MobileMenu } from '../items/Menu.jsx';
import { NavLink } from 'react-router-dom';
import { UserMenu } from '../items/UserMenu.jsx';
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
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
                <NavLink to="/favorites" className="relative group flex items-center gap-2">
                  <p className="text-gray-700 group-hover:text-blue-900 transition-colors font-medium text-lg">
                    Mes Favoris
                  </p>
                  <div className="relative">
                    <Heart className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" /> 
                    {favoritesCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold border-2 border-white">
                        {favoritesCount}
                      </span>
                    )}
                  </div>
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
              {isAdminAuthenticated ? (
                <NavLink to="/espace-prive">
                  <p className="text-gray-700 hover:text-blue-900 transition-colors font-medium text-lg">
                    Espace Admin
                  </p>
                </NavLink>
              ) : isAuthenticated ? (
                <UserMenu />
              ) : (
                <NavLink to="/login" className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <User size={20} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <p className="text-gray-700 group-hover:text-blue-900 transition-colors font-medium text-lg">
                    Se connecter
                  </p>
                </NavLink>
              )}
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
