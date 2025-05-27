import React from 'react';
import { useAuth } from '../../services/auth/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
  hideWhenDenied?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
  hideWhenDenied = false
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, hide content
  if (!isAuthenticated || !user) {
    return hideWhenDenied ? null : fallback;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = user.roles.some(role => allowedRoles.includes(role));

  if (!hasRequiredRole) {
    return hideWhenDenied ? null : fallback;
  }

  return <>{children}</>;
};

export default RoleGuard;