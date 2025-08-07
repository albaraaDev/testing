import { Modal, ModalContent, ModalHeader, ModalBody } from '@/components/modal';
import { KeenIcon } from '@/components';
import { FormattedMessage } from 'react-intl';
import { ViewUserComponent } from '@/pages/management/blocks/view-user-component';
import { UserModel } from '@/api/user';

interface ViewUserModalProps {
  open: boolean;
  onClose: () => void;
  user: UserModel | null;
}

const ViewUserModal = ({ open, onClose, user }: ViewUserModalProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="modal-center w-full max-w-[680px] max-h-[95%] scrollable-y-auto">
        <ModalHeader className="justify-between border-b">
          <h2 className="modal-title">
            <FormattedMessage id="USERS.VIEW" defaultMessage="View Distributor" />
          </h2>
          <button className="btn btn-sm btn-icon btn-light btn-clear" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="p-4">
          {user && <ViewUserComponent id={user.id} hideEditButton={true} />}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ViewUserModal;
