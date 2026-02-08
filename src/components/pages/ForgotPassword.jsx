import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { Mail, Lock, Code } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { requestPasswordReset, verifyResetCode, resetPasswordWithCode } = useUserAuth();

  const [step, setStep] = useState(1); // 1: Email, 2: Code & Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }
    if (!validateEmail(email)) {
      setError('Veuillez entrer un email valide');
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.ok) {
      setSuccess('Un code de réinitialisation a été envoyé à votre email');
      setTimeout(() => setStep(2), 1500);
    } else {
      setError(result.error || 'Erreur lors de l\'envoi du code');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code.trim()) {
      setError('Le code est requis');
      return;
    }
    if (!newPassword.trim()) {
      setError('Le mot de passe est requis');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    
    // Vérifier d'abord le code
    const codeCheck = await verifyResetCode(email, code);
    if (!codeCheck.ok) {
      setError(codeCheck.error);
      setLoading(false);
      return;
    }

    // Réinitialiser le mot de passe
    const result = await resetPasswordWithCode(email, code, newPassword);
    setLoading(false);

    if (result.ok) {
      setSuccess('Mot de passe réinitialisé avec succès!');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.error || 'Erreur lors de la réinitialisation');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {step === 1 ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Réinitialiser le mot de passe</h1>
              <p className="text-gray-600">Étape 1: Entrez votre email</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition mt-6"
              >
                {loading ? 'Envoi du code...' : 'Envoyer un code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h1>
              <p className="text-gray-600">Étape 2: Entrez le code et votre nouveau mot de passe</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Code (6 chiffres)</label>
                <div className="relative">
                  <Code size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez votre mot de passe"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition mt-6"
              >
                {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
              >
                Retour
              </button>
            </form>
          </>
        )}

        <p className="text-center text-gray-600 mt-6">
          Vous vous souvenez de votre mot de passe?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Se connecter</Link>
        </p>

        <div className="mt-4 text-center text-sm">
          <Link to="/" className="text-gray-500 hover:underline">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}
