import { useParams } from 'react-router-dom';
import { DeleteIcon, EditIcon } from './svg';
import { deleteDriver } from '@/api/drivers';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useAppRouting } from '@/routing/useAppRouting';

const Toolbar = () => {
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();
  const dialogs = useDialogs();
  const { id } = useParams();
  const navigate = useAppRouting();

  return (
    <div>
      <div className="flex justify-end items-center gap-2 flex-wrap p-4">
        <a href={`/drivers/edit/${id}`}>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-green-500 rounded-md">
            <EditIcon className="w-4 h-4" /> <FormattedMessage id="DRIVER.EDIT" />
          </button>
        </a>

        <button
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-red-500 rounded-md"
          onClick={async () => {
            if (!id) return;
            if (
              !(await dialogs.confirm(
                intl.formatMessage({
                  id: 'DRIVER.DELETE.MODAL_MESSAGE'
                }),
                {
                  title: intl.formatMessage({ id: 'DRIVER.DELETE.MODAL_TITLE' }),
                  okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
                  cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
                }
              ))
            )
              return;
            const delRes = await deleteDriver(id);
            enqueueSnackbar(delRes.message, {
              variant: 'success'
            });
            navigate('/drivers/driver');
          }}
        >
          <DeleteIcon className="w-4 h-4" />
          <FormattedMessage id="DRIVER.DELETE" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
