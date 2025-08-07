import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { useIntl } from 'react-intl';
import { updateRole } from '@/api/roles';
import { useSnackbar } from 'notistack';

interface EditRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roleId: string;
  currentName: string;
}

const EditRoleModal = ({ open, onClose, onSuccess, roleId, currentName }: EditRoleModalProps) => {
  const intl = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const [roleName, setRoleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the name field when modal opens with the current role name
  useEffect(() => {
    if (open) {
      setRoleName(currentName);
    }
  }, [open, currentName]);

  const handleUpdateRole = async () => {
    if (!roleName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await updateRole({ id: roleId, name: roleName });
      // Reset form and close
      onClose();
      // Notify success
      enqueueSnackbar(res.message, {
        variant: 'success'
      });
      // Refresh roles list
      onSuccess();
    } catch (error) {
      console.error('Failed to update role:', error);
      enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }) || 'An error occurred', {
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[500px]">
        <ModalHeader>
          <ModalTitle>
            {intl.formatMessage({ id: 'ROLES.CARD.EDIT_ROLE' }) || 'Edit Role'}
          </ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="p-7">
          <div className="mb-4">
            <label className="form-label mb-2">
              {intl.formatMessage({ id: 'ROLES.CARD.ROLE_NAME' }) || 'Role Name'}
            </label>
            <input
              className="input w-full"
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder={
                intl.formatMessage({ id: 'ROLES.CARD.ENTER_ROLE_NAME' }) || 'Enter role name'
              }
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button className="btn btn-light" onClick={onClose} disabled={isSubmitting}>
              {intl.formatMessage({ id: 'COMMON.CANCEL' }) || 'Cancel'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleUpdateRole}
              disabled={isSubmitting || !roleName.trim() || roleName === currentName}
            >
              {isSubmitting
                ? intl.formatMessage({ id: 'COMMON.SAVING' }) || 'Saving...'
                : intl.formatMessage({ id: 'COMMON.SAVE' }) || 'Save'}
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { EditRoleModal };
