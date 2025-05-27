import React from 'react';
import { useAuth } from '../../services/auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  fallback = <div>Access denied. You don't have permission to view this page.</div>
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, should be handled by the main App router
  if (!isAuthenticated || !user) {
    return fallback;
  }

  // If no specific roles required, just check authentication
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = user.roles.some(role => allowedRoles.includes(role));

  if (!hasRequiredRole) {
    return fallback;
  }

  return <>{children}</>;
};

export default ProtectedRoute;