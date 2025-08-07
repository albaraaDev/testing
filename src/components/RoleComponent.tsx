import { useAuthContext } from '@/auth';
import { ReactNode, useMemo } from 'react';

interface RoleComponentProps {
  role?: string | string[];
  children: ReactNode;
}

const RoleComponent = ({ role, children }: RoleComponentProps) => {
  const { currentUser } = useAuthContext();
  const haveAccess = useMemo(() => {
    if (!role) return true;

    if (Array.isArray(role)) {
      return role.some((r) => currentUser?.role === r);
    }
    return currentUser?.role === role;
  }, [currentUser, role]);

  if (!haveAccess) {
    return <></>;
  }

  return <>{children}</>;
};

export default RoleComponent;
