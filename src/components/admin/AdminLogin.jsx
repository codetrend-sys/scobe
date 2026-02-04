import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

export default function AdminLogin() {
  const { isAdminAuthenticated, login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/espace-prive';

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/espace-prive', { replace: true });
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    const res = await login(email, password);
    if (!res?.ok) {
      setError(res?.error || 'Identifiants admin invalides.');
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <section className="max-w-md mx-auto p-6 mt-16 mb-16 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Bienvenue</h2>
      {/* <p className="text-sm text-gray-500 mb-4">
        Accès réservé à l&apos;administrateur (pas de création de compte).
      </p> */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Se connecter
        </button>
      </form>
      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

      <div className="mt-4 text-center text-sm">
        <NavLink to="/" className="text-gray-500">
          Retour à l&apos;accueil
        </NavLink>
      </div>
    </section>
  );
}

