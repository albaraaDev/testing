import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { useIntl } from 'react-intl';
import { createRole } from '@/api/roles';
import { useSnackbar } from 'notistack';

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RoleModal = ({ open, onClose, onSuccess }: RoleModalProps) => {
  const intl = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const [newRoleName, setNewRoleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveRole = async () => {
    if (!newRoleName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createRole({ name: newRoleName });
      // Reset form and close
      setNewRoleName('');
      onClose();
      // Notify success
      enqueueSnackbar(res.message, {
        variant: 'success'
      });
      // Refresh roles list
      onSuccess();
    } catch (error) {
      console.error('Failed to create role:', error);
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
          <ModalTitle>{intl.formatMessage({ id: 'ROLES.PAGE.NEW_ROLE' })}</ModalTitle>
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
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder={
                intl.formatMessage({ id: 'ROLES.CARD.ENTER_ROLE_NAME' }) || 'Enter role name'
              }
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              className="btn btn-light"
              onClick={() => {
                onClose();
                setNewRoleName('');
              }}
              disabled={isSubmitting}
            >
              {intl.formatMessage({ id: 'COMMON.CANCEL' }) || 'Cancel'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveRole}
              disabled={isSubmitting || !newRoleName.trim()}
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

export { RoleModal };
