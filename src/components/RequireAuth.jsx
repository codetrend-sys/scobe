import React from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useUserAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
