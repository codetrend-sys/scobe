import { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // or 'register'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/checkout';

  const [error, setError] = useState('');

  const validateEmail = (val) => /\S+@\S+\.\S+/.test(val);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !validateEmail(email)) { setError('Email invalide'); return; }
    if (mode === 'register' && !name) { setError('Veuillez entrer votre nom'); return; }
    // password not used for demo but require at least 4 chars
    if (!password || password.length < 4) { setError('Mot de passe minimum 4 caractères'); return; }

    if (mode === 'login') {
      const u = login(email);
      if (!u) {
        setError("Aucun compte trouvé pour cet e-mail. Veuillez créer un compte.");
        return;
      }
      navigate(from);
    } else {
      register(name, email);
      navigate(from);
    }
  };

  return (
    <section className="max-w-md mx-auto p-6 mt-16 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Se connecter' : 'Créer un compte'}</h2>
      <form onSubmit={submit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded">{mode === 'login' ? 'Se connecter' : "S'inscrire"}</button>
      </form>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

      <div className="mt-4 text-sm text-gray-600">
        {mode === 'login' ? (
          <>Pas de compte ? <button type="button" onClick={() => setMode('register')} className="text-blue-600">Créer un compte</button></>
        ) : (
          <>Vous avez déjà un compte ? <button type="button" onClick={() => setMode('login')} className="text-blue-600">Se connecter</button></>
        )}
      </div>

      <div className="mt-4 text-center text-sm">
        <NavLink to="/" className="text-gray-500">Retour à l'accueil</NavLink>
      </div>
    </section>
  );
}
