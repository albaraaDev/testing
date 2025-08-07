import { Modal, ModalContent, ModalHeader, ModalBody } from '@/components/modal';
import { KeenIcon } from '@/components';
import { FormattedMessage } from 'react-intl';
import { EditUserComponent } from '@/pages/management/blocks/edit-user-component';
import { FormUserModel } from '@/api/user';
import logger from '@/utils/Logger';
import { useEffect } from 'react';

interface EditDistributorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultModel?: FormUserModel | null;
}

const EditDistributorModal = ({
  open,
  onClose,
  onSuccess,
  defaultModel
}: EditDistributorModalProps) => {
  useEffect(
    () => logger.debug('EditDistributorModal', { open, onClose, onSuccess, defaultModel }),
    [defaultModel, onClose, onSuccess, open]
  );

  defaultModel = defaultModel || ({} as FormUserModel);
  if (defaultModel != null) defaultModel.role = 'DISTRIBUTOR';

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="modal-center w-full max-w-[680px] max-h-[95%] scrollable-y-auto">
        <ModalHeader className="justify-between border-b">
          <h2 className="modal-title">
            <FormattedMessage id="DISTRIBUTORS.ADD" defaultMessage="Add Distributor" />
          </h2>
          <button className="btn btn-sm btn-icon btn-light btn-clear" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="p-0">
          <EditUserComponent
            id={defaultModel?.id || undefined}
            roleEditable={false}
            defaultModel={defaultModel}
            submitCallback={() => {
              if (onSuccess) {
                onSuccess();
              } else {
                onClose();
              }
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditDistributorModal;
