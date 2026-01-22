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

export function Header() {
  const { cartItems, setOpen } = useCart();
  // const { user } = useAuth();
  // const navigate = useNavigate();
  const { favorites } = useFavorites();
  const favoritesCount = favorites.length;

  // Show number of distinct products (length) instead of total quantity
  const cartCount = cartItems.length;
  return (
    <header className="sticky top-0 z-50 bg-white/25 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">

            {/* menu */}
            {/* <button className="lg:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button> */}
            <MobileMenu/>

            {/* logo */}
            
            <NavLink to={`/`}>
            <div className=" flex items-center justify-center ">
                <img src={logo} alt="" className='w-15 h-12 mb-2' />   
            </div>
            </NavLink>

            {/* navigation */}
            <nav className="hidden lg:flex items-center gap-7">
              <NavLink to={`/`}>
              <p  className="text-gray-700 hover:text-blue-900 transition-colors font-medium">
                Accueil
              </p>
              </NavLink>
              <NavLink to="/favorites" className="relative p-2 hover:text-blue-900  rounded-full transition-colors flex items-center gap-2">
                Mes Favoris <Heart className="w-6 h-6 text-red-500" /> 
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {favoritesCount}
                  </span>
                )}
              </NavLink>
              {/* <a href="#" className="text-gray-700 hover:text-blue-900 transition-colors font-medium">
                Catégories
              </a> */}
              <CategoriesDropdown/>

              <NavLink to={`/contact`}>
              <p  className="text-gray-700 hover:text-blue-900 transition-colors font-medium">
                Contact
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
  );
}
