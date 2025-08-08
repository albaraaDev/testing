import { createMaintenance } from '@/api/maintenance';
import { ResponseModel } from '@/api/response';
import { KeenIcon } from '@/components';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@/components/modal';
import { VehicleSearch } from '@/pages/driver/add-driver/blocks/VehicleSearch';
import { MaintenanceTypeDropdownSearch } from '@/pages/maintenance/components';
import axios, { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface MaintenanceModalProps {
  open: boolean;
  onClose: () => void;
  reservationId: string;
  customerId: string;
  customerName: string;
  vehiclePlate: string;
  onSuccess?: () => void;
}

const MaintenanceModal = ({
  open,
  onClose,
  reservationId,
  customerId,
  customerName,
  vehiclePlate,
  onSuccess
}: MaintenanceModalProps) => {
  const intl = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedStatus, setSelectedStatus] = useState<'ongoing' | 'finished'>('ongoing');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData(e.target as HTMLFormElement);

    // Add hidden reservation data
    data.append('reservationId', reservationId);
    data.append('customerId', customerId);

    try {
      const res = await createMaintenance(data);
      enqueueSnackbar(res.message, {
        variant: 'success'
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ResponseModel<never>>;
        enqueueSnackbar(
          axiosError.response?.data.message || intl.formatMessage({ id: 'COMMON.ERROR' }),
          { variant: 'error' }
        );
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), { variant: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="modal-center w-full max-w-[800px] max-h-[95%] scrollable-y-auto">
        <ModalHeader className="justify-between border-b">
          <h2 className="modal-title">
            <FormattedMessage id="MAINTENANCE.ADD.TITLE" />
          </h2>
          <button
            className="btn btn-sm btn-icon btn-light btn-clear"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-5">
              {/* Related Reservation - Disabled */}
              <div className="grid gap-2.5">
                <label className="form-label">
                  <FormattedMessage id="MAINTENANCE.FORM.RESERVATION" />
                </label>
                <input
                  type="text"
                  value={`#${reservationId.slice(-12)} - ${customerName} - ${vehiclePlate}`}
                  disabled
                  className="input bg-gray-50 cursor-not-allowed"
                  readOnly
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                {/* Vehicle Search */}
                <div className="flex flex-col gap-2.5">
                  <label className="form-label">
                    <FormattedMessage id="MAINTENANCE.FORM.VEHICLE" />
                  </label>
                  <VehicleSearch place="bottom" required />
                </div>

                {/* Maintenance Type */}
                <div className="flex flex-col gap-2.5">
                  <label className="form-label">
                    <FormattedMessage id="MAINTENANCE.FORM.TYPE" />
                  </label>
                  <MaintenanceTypeDropdownSearch />
                </div>
              </div>

              {/* Start and End Date */}
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2.5">
                  <label className="form-label">
                    <FormattedMessage id="MAINTENANCE.FORM.START_DATE" />
                  </label>
                  <input
                    required
                    type="date"
                    className="input w-full dark:[color-scheme:dark]"
                    name="startDate"
                  />
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="form-label">
                    <FormattedMessage id="MAINTENANCE.FORM.END_DATE" />
                  </label>
                  <input
                    required
                    type="date"
                    className="input w-full dark:[color-scheme:dark]"
                    name="endDate"
                  />
                </div>
              </div>

              {/* Supplier and Price */}
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="grid gap-2.5">
                  <label className="form-label">
                    <FormattedMessage id="MAINTENANCE.FORM.SUPPLIER" />
                  </label>
                  <input
                    required
                    type="text"
                    id="supplier"
                    name="supplier"
                    className="input"
                    placeholder={intl.formatMessage({
                      id: 'MAINTENANCE.FORM.SUPPLIER.PLACEHOLDER'
                    })}
                  />
                </div>
                <div className="grid gap-2.5">
                  <label className="form-label">
                    <FormattedMessage id="MAINTENANCE.FORM.PRICE" />
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    className="input"
                    placeholder={intl.formatMessage({ id: 'MAINTENANCE.FORM.PRICE.PLACEHOLDER' })}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="w-full grid gap-2.5">
                <label className="form-label">
                  <FormattedMessage id="MAINTENANCE.FORM.DESCRIPTION" />
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="input p-2 max-h-[100px] min-h-[50px]"
                  placeholder={intl.formatMessage({
                    id: 'MAINTENANCE.FORM.DESCRIPTION.PLACEHOLDER'
                  })}
                  rows={4}
                />
              </div>

              {/* Status */}
              <div className="w-full grid gap-2.5">
                <label className="form-label">
                  <FormattedMessage id="MAINTENANCE.FORM.STATUS" />
                </label>
                <div
                  className={`flex items-center gap-2 p-2 rounded-md border border-dashed hover:bg-gray-100 transition-colors cursor-pointer
                    ${selectedStatus === 'ongoing' ? 'border-blue-500' : 'border-gray-300'}`}
                  onClick={() => setSelectedStatus('ongoing')}
                >
                  <input
                    type="radio"
                    name="status"
                    value="ongoing"
                    checked={selectedStatus === 'ongoing'}
                    onChange={() => setSelectedStatus('ongoing')}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 rounded-full bg-gray-200
                      ${selectedStatus === 'ongoing' ? 'border-4 border-blue-500' : 'border-2 border-gray-300'}`}
                  />
                  <span className="text-yellow-500">
                    <FormattedMessage id="MAINTENANCE.STATUS.ONGOING" />
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 p-2 rounded-md border border-dashed hover:bg-gray-100 transition-colors cursor-pointer
                    ${selectedStatus === 'finished' ? 'border-blue-500' : 'border-gray-300'}`}
                  onClick={() => setSelectedStatus('finished')}
                >
                  <input
                    type="radio"
                    name="status"
                    value="finished"
                    checked={selectedStatus === 'finished'}
                    onChange={() => setSelectedStatus('finished')}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 rounded-full bg-gray-200
                      ${selectedStatus === 'finished' ? 'border-4 border-blue-500' : 'border-2 border-gray-300'}`}
                  />
                  <span className="text-green-500">
                    <FormattedMessage id="MAINTENANCE.STATUS.FINISHED" />
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <FormattedMessage id="COMMON.CANCEL" />
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <FormattedMessage id="COMMON.SAVING" />
                ) : (
                  <FormattedMessage id="COMMON.ADD" />
                )}
              </button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MaintenanceModal;
