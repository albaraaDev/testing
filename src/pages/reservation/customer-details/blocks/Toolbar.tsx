import { useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useAppRouting } from '@/routing/useAppRouting';
import { DeleteIcon, EditIcon } from '@/assets/svg';
import ExtendIcon from '@/assets/svg/Extend';
import { deleteReservation } from '@/api/reservations';

const Toolbar = () => {
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();
  const dialogs = useDialogs();
  const { id } = useParams();
  const navigate = useAppRouting();

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
    </div>
  );
};

export default Toolbar;
