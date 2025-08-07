import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/partials/toolbar';
import { PageNavbar } from '@/pages/account';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { DeviceDTO, getDeviceModel, updateDevice, createDevice } from '@/api/devices';
import { AddDevicePage } from './AddDevicePage';
import { CircularProgress } from '@mui/material';
import axios, { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { ResponseModel } from '@/api/response';
import { FormattedMessage, useIntl } from 'react-intl';
import logger from '@/utils/Logger';
import { useAppRouting } from '@/routing/useAppRouting';

const AddDevice = () => {
  const intl = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useAppRouting();
  const { id } = useParams();
  const [device, setDevice] = useState<DeviceDTO | undefined>(undefined);

  useEffect(() => {
    if (id) {
      getDeviceModel(id).then(setDevice);
    }
  }, [id]);

  const Actions = () => (
    <ToolbarActions>
      <button
        type="button"
        className="text-red-700 hover:text-white border bg-red-100 border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
        onClick={() => navigate(-1)}
      >
        <FormattedMessage id="COMMON.DISCARD" />
      </button>
      <button
        type="submit"
        className="focus:outline-none text-white bg-green-500 w-40 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-xs px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >
        {device ? <FormattedMessage id="COMMON.SAVE" /> : <FormattedMessage id="COMMON.ADD" />}
      </button>
    </ToolbarActions>
  );

  return (
    <form
      className="pb-10"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        logger.debug('Form data:', Object.fromEntries(data.entries()));
        try {
          const res = device ? await updateDevice(device.id, data) : await createDevice(data);
          enqueueSnackbar(res.message),
            {
              variant: 'success'
            };
          navigate('/devices/device');
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
        }
      }}
    >
      <PageNavbar />

      {id && !device ? (
        <div className="flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <h1 className="text-xl font-medium leading-none text-gray-900">
                {device ? (
                  <FormattedMessage id="DEVICE.EDIT.TITLE" />
                ) : (
                  <FormattedMessage id="DEVICE.ADD.TITLE" />
                )}
              </h1>
            </ToolbarHeading>
            <Actions />
          </Toolbar>

          <AddDevicePage device={device} />

          <div className="flex justify-end pt-6">
            <Actions />
          </div>
        </Container>
      )}
    </form>
  );
};

export { AddDevice };
