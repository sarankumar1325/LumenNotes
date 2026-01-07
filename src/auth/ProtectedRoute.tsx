import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#292524] rounded-full opacity-20 animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
