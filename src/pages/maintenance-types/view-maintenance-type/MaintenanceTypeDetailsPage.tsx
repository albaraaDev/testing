import { Fragment, useEffect, useState } from 'react';
import { Container } from '@/components/container';
import { PageNavbar } from '@/pages/account';
import { Link } from 'react-router-dom';
import {
  deleteMaintenanceType,
  getMaintenanceTypeById,
  getMaintenanceTypeTitle,
  IMaintenanceTypeTableData
} from '@/api/maintenance-type';
import { useParams } from 'react-router';
import { DeleteIcon, EditIcon } from '@/pages/driver/svg';
import { ArrowLeftIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDialogs } from '@toolpad/core/useDialogs';
import axios, { AxiosError } from 'axios';
import { ResponseModel } from '@/api';
import { useAppRouting } from '@/routing/useAppRouting';
import { useCurrentLanguage } from '@/providers';

const MaintenanceTypeDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useAppRouting();
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();
  const intl = useIntl();
  const [model, setModel] = useState<IMaintenanceTypeTableData>();
  const [loading, setLoading] = useState<boolean>(false);
  const language = useCurrentLanguage();

  const title = model ? getMaintenanceTypeTitle(model, language.code) : null;

  useEffect(() => {
    if (id) {
      setLoading(true);
      getMaintenanceTypeById(id)
        .then((response) => {
          const { result } = response;
          if (result) {
            setModel(result);
          }
        })
        .catch(() => {
          navigate('/error/404');
        })
        .finally(() => {
          setLoading(false);
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
            id: 'MAINTENANCE_TYPE.DELETE.MODAL_MESSAGE'
          }),
          {
            title: intl.formatMessage({ id: 'MAINTENANCE_TYPE.DELETE.MODAL_TITLE' }),
            okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
            cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
          }
        ))
      ) {
        return;
      }
      try {
        const response = await deleteMaintenanceType(id);
        navigate('/maintenance/maintenance-type/list');
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
            <FormattedMessage id="MAINTENANCE_TYPE.DETAILS.TITLE" />
          </h1>
          <div className="flex justify-end items-center gap-2 flex-wrap p-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-blue-500 rounded-md"
            >
              <ArrowLeftIcon className="w-4 h-4 rtl:-scale-x-100" />
              <FormattedMessage id="COMMON.BACK" />
            </button>
            <Link to={`/maintenance/maintenance-type/edit/${id}`}>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-green-500 rounded-md">
                <EditIcon className="w-4 h-4" />
                <FormattedMessage id="COMMON.EDIT" />
              </button>
            </Link>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-red-500 rounded-md"
              onClick={handleDelete}
            >
              <DeleteIcon className="w-4 h-4" />
              <FormattedMessage id="COMMON.DELETE" />
            </button>
          </div>
        </div>
        <div className="grid gap-5 lg:gap-7.5 xl:w-[60rem] mx-auto">
          <div className="card">
            {loading ? (
              <div className="flex justify-center items-center">
                <span>
                  <FormattedMessage id="COMMON.LOADING" />
                </span>
              </div>
            ) : (
              <div>
                <div className="card-header" id="maintenance_settings">
                  <h3 className="card-title">
                    <FormattedMessage id="MAINTENANCE_TYPE.FORM.TITLE" />
                  </h3>
                </div>
                <form className="card-body grid gap-5 py-6">
                  <div className="grid gap-2.5">
                    <h1 className="text-white">ID</h1>
                    <span>{model?.id}</span>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-5">
                    <div className="grid gap-2.5">
                      <h1 className="text-white">
                        <FormattedMessage id="MAINTENANCE_TYPE.FORM.FIELD.TITLE" />
                      </h1>
                      <span>{title}</span>
                    </div>
                    <div className="grid gap-2.5">
                      <h1 className="text-white">
                        <FormattedMessage id="MAINTENANCE_TYPE.FORM.FIELD.CODE" />
                      </h1>
                      <span>{model?.code}</span>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { MaintenanceTypeDetailsPage };
