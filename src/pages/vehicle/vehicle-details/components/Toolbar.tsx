import { Link, useParams } from 'react-router-dom';
import { DeleteIcon, EditIcon, MaintenanceIcon, ViolationsIcon } from '../../blocks/svg';
import { Container } from '@/components';
import { deleteVehicle } from '@/api/cars';
import { useSnackbar } from 'notistack';
import { useIntl, FormattedMessage } from 'react-intl';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useAppRouting } from '@/routing/useAppRouting';

const Toolbar = ({ carId, plate }: { carId?: string | null; plate?: string | null }) => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();
  const navigate = useAppRouting();
  const intl = useIntl();

  return (
    <Container>
      <div className="flex justify-end items-center gap-2 flex-wrap p-4">
        <Link to={`/vehicles/edit/${id}`}>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-green-500 rounded-md">
            <EditIcon className="w-4 h-4" />
            <FormattedMessage id="VEHICLE.TOOLBAR.EDIT" />
          </button>
        </Link>

        <Link to={`/vehicles/edit-scratches/${id}`}>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-purple-500 rounded-md">
            <EditIcon className="w-4 h-4" color="#6B46C1" />
            <FormattedMessage id="VEHICLE.TOOLBAR.ADD_SCRATCH" />
          </button>
        </Link>

        <Link to={`/maintenance/add?vehicleId=${id}&plate=${plate}`}>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-[#1BC5BD] rounded-md">
            <MaintenanceIcon className="w-4 h-4" />
            <FormattedMessage id="VEHICLE.TOOLBAR.MAINTENANCE" />
          </button>
        </Link>

        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-red-500 rounded-md">
          <ViolationsIcon className="w-4 h-4" />
          <FormattedMessage id="VEHICLE.TOOLBAR.VIOLATIONS" />
        </button>

        <button
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-red-500 rounded-md"
          onClick={async () => {
            if (!carId) return;
            if (
              !(await dialogs.confirm(
                intl.formatMessage({
                  id: 'VEHICLE.DELETE.MODAL_MESSAGE'
                }),
                {
                  title: intl.formatMessage({ id: 'VEHICLE.DELETE.MODAL_TITLE' }),
                  okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
                  cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
                }
              ))
            )
              return;
            const delRes = await deleteVehicle(carId);
            enqueueSnackbar(delRes.message, {
              variant: 'success'
            });
            navigate('/vehicles/vehicle');
          }}
        >
          <DeleteIcon className="w-4 h-4" />
          <FormattedMessage id="VEHICLE.TOOLBAR.DELETE" />
        </button>
      </div>
    </Container>
  );
};

export default Toolbar;
