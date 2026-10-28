import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, initAuth, userRole } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (userRole === 'Employee') {
      return <Navigate to="/employee/quick-order" replace />;
    }
    return <Navigate to="/dashboard/home" replace />;
  }

  return children;
};

export default PublicRoute;
