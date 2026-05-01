import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Package, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useUserAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md transition-all group"
      >
        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
          <User size={18} />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Mon Compte</p>
          <p className="text-xs font-bold text-gray-700 truncate max-w-[100px]">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] animate-in fade-in zoom-in duration-300">
          <div className="p-4 bg-gray-50/50 border-b border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Connecté en tant que</p>
            <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
          </div>
          
          <div className="p-2">
            <NavLink
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
            >
              <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
                <UserCircle size={18} />
              </div>
              <span className="text-sm font-bold">Mon Profil</span>
            </NavLink>

            <NavLink
              to="/my-orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
            >
              <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
                <Package size={18} />
              </div>
              <span className="text-sm font-bold">Mes Commandes</span>
            </NavLink>

            <div className="h-px bg-gray-100 my-2 mx-4" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors group"
            >
              <div className="p-2 bg-red-50/50 rounded-xl group-hover:bg-white transition-colors">
                <LogOut size={18} />
              </div>
              <span className="text-sm font-bold">Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
