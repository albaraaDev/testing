import { UserList } from '@/pages/user';
import { PermissionsCheck } from './blocks';
import { Role } from '@/api/roles';

interface AccountPermissionsCheckContentProps {
  role: Role | null;
}

const AccountPermissionsCheckContent = ({ role }: AccountPermissionsCheckContentProps) => {
  return (
    <div className="flex flex-col gap-5 lg:gap-7.5">
      <PermissionsCheck role={role} />

      <UserList refetch={() => {}} filterByRoleId={role?.id} />
    </div>
  );
};

export { AccountPermissionsCheckContent };
