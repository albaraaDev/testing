import { Link } from 'react-router-dom';
import { useState } from 'react';
import { KeenIcon } from '@/components';
import {
  Menu,
  MenuItem,
  MenuIcon,
  MenuLink,
  MenuTitle,
  MenuSub,
  MenuToggle
} from '@/components/menu';
import { useLanguage } from '@/i18n';
import { deleteRole } from '@/api/roles';
import { useIntl } from 'react-intl';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useSnackbar } from 'notistack';
import { EditRoleModal } from '@/pages/account/members/roles/blocks';

interface IRoleProps {
  id: string;
  title: string;
  onDelete?: () => void;
}

const CardRole = ({ id, title, onDelete }: IRoleProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { isRTL } = useLanguage();
  const intl = useIntl();
  const dialogs = useDialogs();
  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    // Use dialog confirmation instead of window.confirm
    if (
      !(await dialogs.confirm(intl.formatMessage({ id: 'ROLES.CARD.DELETE_CONFIRM' }), {
        title: `${intl.formatMessage({ id: 'ROLES.CARD.DELETE' })} - ${title}`,
        okText: intl.formatMessage({ id: 'ROLES.CARD.DELETE' }),
        cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
      }))
    )
      return;

    setIsDeleting(true);
    try {
      const deleteRes = await deleteRole(id);
      // Show success notification
      enqueueSnackbar(deleteRes.message, {
        variant: 'success'
      });
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Failed to delete role:', error);
      enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), {
        variant: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle successful role edit
  const handleEditSuccess = () => {
    if (onDelete) {
      // We're reusing the onDelete callback as it already refreshes the roles list
      onDelete();
    }
  };

  return (
    <>
      <div className="card flex flex-col gap-5 p-5 lg:p-7.5">
        <div className="flex items-center flex-wrap justify-between gap-1">
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col">
              <Link
                to={`/roles/${id}/permissions`}
                className="text-md font-medium text-gray-900 hover:text-primary-active mb-px"
              >
                {title}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/roles/${id}/permissions`}>
              <div className="flex justify-center items-center size-7.5 bg-gray-400 rounded-full cursor-pointer hover:bg-gray-500">
                <KeenIcon icon="users" className="text-white dark:text-black" />
              </div>
            </Link>

            <Menu>
              <MenuItem
                toggle="dropdown"
                trigger="click"
                dropdownProps={{
                  placement: isRTL() ? 'bottom-start' : 'bottom-end',
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: isRTL() ? [0, 10] : [0, 10]
                      }
                    }
                  ]
                }}
              >
                <MenuToggle className="flex justify-center items-center size-7.5 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
                  <KeenIcon icon="dots-vertical" className="text-gray-600" />
                </MenuToggle>
                <MenuSub className="menu-default" rootClassName="w-full max-w-[175px]">
                  <MenuItem path="#" onClick={() => setIsEditModalOpen(true)}>
                    <MenuLink>
                      <MenuIcon>
                        <KeenIcon icon="notepad-edit" className="text-primary" />
                      </MenuIcon>
                      <MenuTitle>
                        {intl.formatMessage({ id: 'ROLES.CARD.EDIT' }) || 'Edit'}
                      </MenuTitle>
                    </MenuLink>
                  </MenuItem>
                  <MenuItem path="#" onClick={handleDelete}>
                    <MenuLink>
                      <MenuIcon>
                        <KeenIcon icon="trash" className="text-danger" />
                      </MenuIcon>
                      <MenuTitle>
                        {isDeleting
                          ? intl.formatMessage({ id: 'ROLES.CARD.DELETING' })
                          : intl.formatMessage({ id: 'ROLES.CARD.DELETE' })}
                      </MenuTitle>
                    </MenuLink>
                  </MenuItem>
                </MenuSub>
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>

      {/* Edit Role Modal */}
      <EditRoleModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        roleId={id}
        currentName={title}
      />
    </>
  );
};

export { CardRole, type IRoleProps };
