import React, { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { deleteMaintenance, getMaintenanceById, MaintenanceModel } from '@/api/maintenance.ts';
import { PageNavbar } from '@/pages/account';
import { Container, KeenIcon } from '@/components';
import { ArrowLeftIcon } from 'lucide-react';
import { DeleteIcon, EditIcon } from '@/pages/driver/svg';
import { format } from 'date-fns';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate.tsx';
import { CircularProgress } from '@mui/material';
import Image from '@/components/image/Image';
import { useDialogs } from '@toolpad/core/useDialogs';
import axios, { AxiosError } from 'axios';
import { ResponseModel } from '@/api';
import { useAppRouting } from '@/routing/useAppRouting';

const MaintenanceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const dialogs = useDialogs();
  const navigate = useAppRouting();
  const { enqueueSnackbar } = useSnackbar();
  const [model, setModel] = useState<MaintenanceModel>();
  const intl = useIntl();

  useEffect(() => {
    if (id) {
      getMaintenanceById(id)
        .then((response) => {
          const { result } = response.data;
          if (result) {
            setModel(result);
          }
        })
        .catch(() => {
          navigate('/error/404');
        });
    }
  }, [id, navigate]);

  if (!id) {
    navigate('/error/404');
    return null;
  }

  const handleBack = () => {
    navigate(-1);
  };

  const handleDelete = async () => {
    if (id) {
      if (
        !(await dialogs.confirm(
          intl.formatMessage({
            id: 'MAINTENANCE.DELETE.MODAL_MESSAGE'
          }),
          {
            title: intl.formatMessage({ id: 'MAINTENANCE.DELETE.MODAL_TITLE' }),
            okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
            cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
          }
        ))
      ) {
        return;
      }

      try {
        const response = await deleteMaintenance(id);
        navigate('/maintenance/maintenance');
        enqueueSnackbar(response.message, {
          variant: response.success ? 'success' : 'error'
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ResponseModel<never>>;
          enqueueSnackbar(axiosError.response?.data.message || 'An error occurred', {
            variant: 'error'
          });
        } else {
          enqueueSnackbar(intl.formatMessage({ id: 'SNACKBAR.DEFAULT_ERROR' }), {
            variant: 'error'
          });
        }
      }
    }
  };

  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <div className="flex justify-between items-center gap-6">
          <h1 className="text-xl font-medium leading-none text-gray-900">
            <FormattedMessage id="MAINTENANCE.DETAILS.TITLE" defaultMessage="Maintenance Details" />
          </h1>
          <div className="flex justify-end items-center gap-2 flex-wrap p-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-blue-500 rounded-md"
            >
              <ArrowLeftIcon className="w-4 h-4 rtl:-scale-x-100" />
              <FormattedMessage id="COMMON.BACK" defaultMessage="Back" />
            </button>
            <Link to={`/maintenance/edit/${id}`}>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-green-500 rounded-md">
                <EditIcon className="w-4 h-4" />
                <FormattedMessage id="COMMON.EDIT" defaultMessage="Edit" />
              </button>
            </Link>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-red-500 rounded-md"
              onClick={handleDelete}
            >
              <DeleteIcon className="w-4 h-4" />
              <FormattedMessage id="COMMON.DELETE" defaultMessage="Delete" />
            </button>
          </div>
        </div>
        {!model ? (
          <div className="flex justify-center items-center h-[70vh]">
            <CircularProgress />
          </div>
        ) : (
          <div className="grid gap-5 lg:gap-7.5 xl:w-[60rem] mx-auto pt-4">
            <div className="p-6 max-w-4xl mx-auto">
              <div className="card flex flex-row items-start gap-6 mb-8 p-8">
                <Image
                  src={model.vehicleImage}
                  alt={model.vehiclePlate}
                  title={model.vehiclePlate}
                  className="w-48 h-36 object-cover rounded-lg"
                  fallback={
                    <div className="bg-neutral-200 w-48 h-36 aspect-square rounded-lg flex items-center justify-center">
                      <KeenIcon style="duotone" icon="car" className="text-black text-[96px]" />
                    </div>
                  }
                />
                <div className="flex-grow">
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h2 className="text-xl font-medium text-gray-800">
                        {model?.vehicleBrand ?? <FormattedMessage id="COMMON.UNKNOWN" />}
                      </h2>
                      <p className="text-gray-500">
                        {model?.vehicleModel ?? <FormattedMessage id="COMMON.UNKNOWN" />}
                      </p>
                    </div>
                    <CarPlate plate={model?.vehiclePlate} />
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-md border border-gray-300 text-green-500 capitalize">
                        {model?.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-8 pt-4">
                    <div className="border border-dashed rounded-lg border-gray-300 p-4">
                      <p className="text-gray-800 font-semibold">
                        {model?.startDate ? format(new Date(model.startDate), 'yyyy-MM-dd') : ''}
                      </p>
                      <p className="text-red-500 text-sm mb-1">
                        <FormattedMessage id="MAINTENANCE.FORM.START_DATE" />
                      </p>
                    </div>

                    <div className="border border-dashed  rounded-lg  border-gray-300 p-4">
                      <p className="text-gray-800 font-semibold">
                        {model?.startDate ? format(new Date(model.endDate!), 'yyyy-MM-dd') : ''}
                      </p>
                      <p className="text-green-500 text-sm mb-1">
                        <FormattedMessage
                          id="MAINTENANCE.DETAILS.FINISHED_DATE"
                          defaultMessage="Finished Date"
                        />
                      </p>
                    </div>

                    <div className="border border-dashed  rounded-lg border-gray-300 p-4">
                      <p className="text-gray-800 font-semibold">
                        {intl.formatNumber(model?.amount || 0, {
                          style: 'currency',
                          currency: 'USD'
                        })}
                      </p>
                      <p className="text-gray-500 text-sm mb-1">
                        <FormattedMessage id="MAINTENANCE.FORM.PRICE" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mt-8 p-4">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  <FormattedMessage id="VEHICLE.FORM.INFORMATION" />
                </h3>
                <div className="divide-y divide-gray-200">
                  <div className="py-4 grid grid-cols-[100px,1fr] gap-4">
                    <span className="text-gray-500">
                      <FormattedMessage id="MAINTENANCE.FORM.TYPE" />
                    </span>
                    <span className="text-gray-800">{model?.type}</span>
                  </div>

                  <div className="py-4 grid grid-cols-[100px,1fr] gap-4">
                    <span className="text-gray-500">
                      <FormattedMessage id="MAINTENANCE.FORM.SUPPLIER" />
                    </span>
                    <span className="text-gray-800">{model?.supplier}</span>
                  </div>

                  <div className="py-4 grid grid-cols-[100px,1fr] gap-4">
                    <span className="text-gray-500">
                      <FormattedMessage id="MAINTENANCE.FORM.DESCRIPTION" />
                    </span>
                    <p className="text-gray-800">{model?.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </Fragment>
  );
};

export default MaintenanceDetails;
