// /frontend/src/components/PublicRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactElement;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isLoggedIn, user } = useAuth();

  // If the user is logged in AND they are an admin,
  // redirect them away from the public page to the admin dashboard.
  if (isLoggedIn && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // If the user is not an admin (or not logged in),
  // show the public page they requested.
  return children;
};

export default PublicRoute;