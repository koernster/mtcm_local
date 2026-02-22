// ProtectedRoute.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    login();
  }

  return <Outlet />;
};

export default ProtectedRoute;