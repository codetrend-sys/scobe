import { Menu, X, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink } from 'react-router-dom';
import { CategoriesDropdown } from "./DropDown.jsx";
import { SearchBar } from './SearchBar.jsx';
import logo from '../../images/logo.png';
import { useFavorites } from '../../context/FavoritesContext.jsx';


export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);
  const { favorites } = useFavorites();
  const favoritesCount = favorites.length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-200"
      >
        <Menu className="w-6 h-6" />
      </button>

      {createPortal(
        <>
          <div
            onClick={() => setOpen(false)}
            className={`fixed inset-0 bg-black/40 transition-opacity
              ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
              z-[1000]`}
          />

          <div
            className={`fixed top-0 left-0 h-screen w-[350px] max-w-[100%] bg-white shadow-xl
              transform transition-transform duration-300
              ${open ? "translate-x-0" : "-translate-x-full"}
              z-[1100]`}
          >
            <div className="flex items-center justify-between p-5 border-b">
               <img src={logo} alt="" className='w-35 h-16 mb-2' />   
              <button onClick={() => setOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="p-5 space-y-4">
              {/* mobile search inside side menu */}
              <div className="md:hidden">
                <SearchBar mobile onSearch={() => setOpen(false)} />
              </div>
              <NavLink to={`/`}>
                <p  className="text-gray-700 mt-5 hover:text-blue-900 transition-colors font-medium">
                  Accueil
                </p>
              </NavLink>
              <NavLink to="/favorites" className="relative text-gray-700 font-medium  hover:text-blue-900  rounded-full transition-colors flex items-center gap-2">
                Mes Favoris <Heart className="w-6 h-6 text-red-500" /> 
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {favoritesCount}
                  </span>
                )}
              </NavLink>
              <CategoriesDropdown />
              <NavLink to={`/contact`}>
                <p  className="text-gray-700 mt-5 hover:text-blue-900 transition-colors font-medium">
                  Contact
                </p>
              </NavLink>            
              </nav>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
