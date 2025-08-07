import { CardRole } from '@/partials/cards';
import { useState, useEffect } from 'react';
import { getRoles, Role } from '@/api/roles';
import { RoleModal } from './RoleModal';

interface IRolesItem {
  id: string;
  title: string;
}

interface IRolesItems extends Array<IRolesItem> {}

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Fetch roles from API
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const rolesData = await getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Handle role deletion
  const handleRoleDelete = () => {
    // Refresh roles list after deletion
    fetchRoles();
  };

  // Convert API roles to card items
  const getRoleItems = () => {
    return roles.map((role) => {
      return {
        title: role.name,
        id: role.id
      };
    });
  };

  const renderItem = (item: IRolesItem, index: number) => {
    return <CardRole key={index} title={item.title} id={item.id} onDelete={handleRoleDelete} />;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7.5">
        {isLoading ? (
          <div className="col-span-3 text-center py-10">Loading roles...</div>
        ) : (
          <>{getRoleItems().map((item, index) => renderItem(item, index))}</>
        )}
      </div>

      {/* Role Modal */}
      <RoleModal
        open={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSuccess={fetchRoles}
      />
    </>
  );
};

export { Roles, type IRolesItem, type IRolesItems };
