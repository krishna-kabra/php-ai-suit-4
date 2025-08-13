import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { apiUtils } from '../services/api';

const RoleProtectedRoute = ({ allowedRoles, redirectTo, component: Component }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (!token || !role) {
          setIsAuthenticated(false);
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        // Check if user has the required role
        if (allowedRoles.includes(role)) {
          setIsAuthenticated(true);
          setUserRole(role);
        } else {
          setIsAuthenticated(false);
          setUserRole(role);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure localStorage is updated
    const timer = setTimeout(checkAuth, 100);
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Component />;
};

export default RoleProtectedRoute;
