import { FormattedMessage } from 'react-intl';
import { Modal, Box } from '@mui/material';
import { DeviceLinking } from '@/pages/user/add-user/blocks/Device';
import { UserType } from '@/api/devices';

// Types and interfaces
interface DeviceLinkingModalProps {
  open: boolean;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
  userType: UserType;
}

// Main Modal Component
export function DeviceLinkingModal({
  open,
  userId,
  onClose,
  onSuccess,
  userType
}: DeviceLinkingModalProps) {
  const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '90vh',
    height: '90vh',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column' as const
  };

  // Handle modal close
  const handleModalClose = (_e: any, _r: string) => {
    onClose();
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleModalClose} disableEscapeKeyDown>
      <Box
        sx={modalStyle}
        className="bg-[--tw-page-bg] dark:bg-[--tw-page-bg-dark] w-[800px] max-w-[800px]"
      >
        <h2 className="text-xl font-semibold mb-4">
          <FormattedMessage
            id="DISTRIBUTORS.DEVICES.MANAGE_DEVICES"
            defaultMessage="Manage Linked Devices"
          />
        </h2>

        <DeviceLinking
          userId={userId}
          onClose={onClose}
          onSuccess={onSuccess}
          userType={userType}
        />
      </Box>
    </Modal>
  );
}
