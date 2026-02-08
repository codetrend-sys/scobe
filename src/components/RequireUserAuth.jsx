import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';

export default function RequireUserAuth({ children }) {
  const { isAuthenticated, loading } = useUserAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">⏳ Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
