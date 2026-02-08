import { useUserAuth } from '../../context/UserAuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User as UserIcon, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

export default function Profile() {
  const { user, logout, isAuthenticated } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!isAuthenticated || !user) return;
      setLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, email, full_name, phone, address, city, postal_code')
          .eq('id', user.id)
          .single();
        if (!mounted) return;
        if (error && error.code !== 'PGRST116') {
          console.warn('profile load error', error);
        }
        setProfile(data || {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          phone: '',
          address: '',
          city: '',
          postal_code: '',
        });
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return null;

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email || '';
  const initials = userName.split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();

  return (
    <section className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="flex flex-col items-center md:items-start md:col-span-1">
            <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center text-3xl font-bold text-green-700 mb-4">
              {initials || <UserIcon className="w-10 h-10" />}
            </div>
            <h1 className="text-xl font-semibold text-gray-800">{userName || '-'}</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="mt-6 w-full">
              <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                <LogOut className="w-4 h-4" /> Se déconnecter
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Détails du compte</h2>
            <div className="bg-gray-50 border border-gray-100 rounded p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Nom</div>
                  <div className="font-medium text-gray-800">{userName || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium text-gray-800">{user?.email}</div>
                </div>
              </div>
            </div>

            <h3 className="text-md font-semibold text-gray-800 mb-2">Informations de livraison (utilisées lors de la commande)</h3>
            <div className="bg-white border border-gray-100 rounded p-4 mb-6">
              {loadingProfile ? (
                <div>Chargement…</div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  setMessage('');
                  try {
                    const toUpsert = {
                      id: user.id,
                      email: user.email,
                      full_name: profile?.full_name || '',
                      phone: profile?.phone || '',
                      address: profile?.address || '',
                      city: profile?.city || '',
                      postal_code: profile?.postal_code || '',
                    };
                    const { data, error } = await supabase
                      .from('user_profiles')
                      .upsert(toUpsert, { returning: 'representation' });
                    if (error) throw error;
                    setProfile(data?.[0] || toUpsert);
                    setMessage('Profil enregistré.');
                  } catch (err) {
                    console.error('Erreur sauvegarde profil', err);
                    setMessage('Erreur lors de la sauvegarde.');
                  } finally {
                    setSaving(false);
                    setTimeout(() => setMessage(''), 3000);
                  }
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600">Nom complet</label>
                      <input
                        type="text"
                        value={profile?.full_name || ''}
                        onChange={(e) => setProfile(p => ({ ...p, full_name: e.target.value }))}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Téléphone</label>
                      <input
                        type="tel"
                        value={profile?.phone || ''}
                        onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-600">Adresse</label>
                      <input
                        type="text"
                        value={profile?.address || ''}
                        onChange={(e) => setProfile(p => ({ ...p, address: e.target.value }))}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Ville</label>
                      <input
                        type="text"
                        value={profile?.city || ''}
                        onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Code postal</label>
                      <input
                        type="text"
                        value={profile?.postal_code || ''}
                        onChange={(e) => setProfile(p => ({ ...p, postal_code: e.target.value }))}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
                      {saving ? 'Enregistrement…' : 'Enregistrer le profil'}
                    </button>
                    {message && <div className="text-sm text-green-600">{message}</div>}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
