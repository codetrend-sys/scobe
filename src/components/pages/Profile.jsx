import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { User as UserIcon, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const initials = (user.name || user.email || '').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();

  return (
    <section className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="flex flex-col items-center md:items-start md:col-span-1">
            <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center text-3xl font-bold text-green-700 mb-4">
              {initials || <UserIcon className="w-10 h-10" />}
            </div>
            <h1 className="text-xl font-semibold text-gray-800">{user.name || '-'}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-6 w-full">
              <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center justify-center ml-[210%] gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                <LogOut className="w-4 h-4 " /> Se déconnecter
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Détails du compte</h2>
            <div className="bg-gray-50 border border-gray-100 rounded p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Nom</div>
                  <div className="font-medium text-gray-800">{user.name || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium text-gray-800">{user.email}</div>
                </div>
              </div>
            </div>

            {/* <h3 className="text-md font-semibold text-gray-800 mb-2">Actions</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/orders')} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100">Mes commandes</button>
              <button onClick={() => navigate('/addresses')} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100">Adresses</button>
              <button onClick={() => alert('Fonctionnalité non implémentée')} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100">Modifier le profil</button>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
