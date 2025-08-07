import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ScreenLoader } from '@/components/loaders';

import { useAuthContext } from './useAuthContext';
import { useMemo } from 'react';

interface RequireRoleProps {
  role?: string | string[];
}

const RequireRole = ({ role }: RequireRoleProps) => {
  const { currentUser, isLoading } = useAuthContext();
  const location = useLocation();
  const haveAccess = useMemo(() => {
    if (!role) return true;

    if (Array.isArray(role)) {
      return role.some((r) => currentUser?.role === r);
    }
    return currentUser?.role === role;
  }, [currentUser, role]);

  if (isLoading) {
    return <ScreenLoader />;
  }

  return haveAccess ? <Outlet /> : <Navigate to="/" state={{ from: location }} replace />;
};

export { RequireRole };
