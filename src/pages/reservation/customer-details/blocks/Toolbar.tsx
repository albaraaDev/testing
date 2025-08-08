import { CustomerDetails } from '@/api/customers';
import { deleteReservation, ReservationDetails } from '@/api/reservations';
import { DeleteIcon, EditIcon } from '@/assets/svg';
import ExtendIcon from '@/assets/svg/Extend';
import { MaintenanceIcon, ViolationsIcon } from '@/assets/svg/menu-icons-tsx';
import { useAppRouting } from '@/routing/useAppRouting';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import MaintenanceModal from './MaintenanceModal';

interface ToolbarProps {
  reservation?: ReservationDetails | null;
  customer?: CustomerDetails | null;
  onMaintenanceSuccess?: () => void;
}

const Toolbar = ({ reservation, customer, onMaintenanceSuccess }: ToolbarProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();
  const dialogs = useDialogs();
  const { id } = useParams();
  const navigate = useAppRouting();
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  const handleOpenMaintenanceModal = () => {
    if (reservation) {
      setIsMaintenanceModalOpen(true);
    }
  };

  const handleMaintenanceSuccess = () => {
    onMaintenanceSuccess?.();
    setIsMaintenanceModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          <FormattedMessage id="RESERVATIONS.DETAIL.TITLE" />
        </h1>
        <div className="flex justify-end items-center gap-2 flex-wrap">
          <a href={`/reservations/edit/${id}`}>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-green-500 rounded-md">
              <EditIcon className="w-4 h-4" /> <FormattedMessage id="RESERVATIONS.EDIT" />
            </button>
          </a>

          <button
            onClick={handleOpenMaintenanceModal}
            disabled={!reservation}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-[#1BC5BD] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1BC5BD] hover:text-white transition-colors"
          >
            <MaintenanceIcon className="w-4 h-4" />
            <FormattedMessage id="VEHICLE.TOOLBAR.MAINTENANCE" />
          </button>

          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-red-500 rounded-md">
            <ViolationsIcon className="w-4 h-4" />
            <FormattedMessage id="VEHICLE.TOOLBAR.VIOLATIONS" />
          </button>

          <a href={`/reservations/handover/${id}`}>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-blue-500 rounded-md">
              <ExtendIcon className="w-4 h-4" /> <FormattedMessage id="RESERVATIONS.HANDOVER" />
            </button>
          </a>

          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-red-500 rounded-md"
            onClick={async () => {
              if (!id) return;
              if (
                !(await dialogs.confirm(
                  intl.formatMessage({
                    id: 'RESERVATIONS.DELETE.MODAL_MESSAGE'
                  }),
                  {
                    title: intl.formatMessage({ id: 'RESERVATIONS.DELETE.MODAL_TITLE' }),
                    okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
                    cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
                  }
                ))
              )
                return;
              const delRes = await deleteReservation(id);
              enqueueSnackbar(delRes.message, {
                variant: 'success'
              });
              navigate('/reservations/reservation');
            }}
          >
            <DeleteIcon className="w-4 h-4" />
            <FormattedMessage id="RESERVATIONS.DELETE" />
          </button>
        </div>
      </div>

      {/* Maintenance Modal */}
      {reservation && (
        <MaintenanceModal
          open={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          reservationId={reservation.id}
          customerId={reservation.customerId}
          customerName={customer?.fullName || reservation.customerFullName || 'Unknown Customer'}
          vehiclePlate={reservation.vehiclePlate || 'No Plate'}
          onSuccess={handleMaintenanceSuccess}
        />
      )}
    </div>
  );
};

export default Toolbar;
