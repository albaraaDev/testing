import { Roles } from './blocks';
import { useState } from 'react';
import { RoleModal } from './blocks';

const AccountRolesContent = () => {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  return (
    <>
      <Roles />
      <RoleModal
        open={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
};

export { AccountRolesContent };
