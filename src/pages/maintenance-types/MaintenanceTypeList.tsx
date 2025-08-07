import {
  DataGrid,
  KeenIcon,
  Menu,
  MenuIcon,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuToggle
} from '@/components';
import React, { useCallback, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { toAbsoluteUrl } from '@/utils';
import { Link } from 'react-router-dom';
import DebouncedSearchInput from '@/components/DebouncedInputField';
import { useCurrentLanguage } from '@/providers';
import {
  deleteMaintenanceType,
  getMaintenanceTypes,
  getMaintenanceTypeTitle,
  IMaintenanceTypeTableData
} from '@/api/maintenance-type.ts';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDialogs } from '@toolpad/core/useDialogs';
import axios, { AxiosError } from 'axios';
import { ResponseModel } from '@/api';
import { useAppRouting } from '@/routing/useAppRouting';

const MaintenanceTypeList = () => {
  const navigate = useAppRouting();
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();
  const [searchQuery, setSearchQuery] = useState('');
  const intl = useIntl();

  const language = useCurrentLanguage();

  const handleDelete = useCallback(
    async (id: string) => {
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
    },
    [dialogs, enqueueSnackbar, intl, navigate]
  );

  const columns = useMemo<ColumnDef<IMaintenanceTypeTableData>[]>(
    () => [
      {
        accessorFn: (row) => getMaintenanceTypeTitle(row, language.code),
        id: 'title',
        header: () => (
          <FormattedMessage id="MAINTENANCE_TYPE.GRID.HEADER.TITLE" defaultMessage="Title" />
        ),
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-800">
            {getMaintenanceTypeTitle(info.row.original, language.code)}
          </span>
        ),
        meta: {
          className: 'min-w-36'
        }
      },
      {
        accessorFn: (row) => row.code,
        id: 'code',
        header: () => (
          <FormattedMessage id="MAINTENANCE_TYPE.GRID.HEADER.CODE" defaultMessage="Code" />
        ),
        enableSorting: true,
        cell: (info) => <span className="text-gray-800">{info.row.original.code}</span>,
        meta: {
          className: 'min-w-36'
        }
      },
      {
        id: 'actions',
        header: () => <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
        cell: (info) => (
          <div className="flex gap-3">
            <Link
              to={`/maintenance/maintenance-type/view/${info.row.original.id}`}
              className="size-7.5"
            >
              <img
                src={toAbsoluteUrl('/media/icons/view.svg')}
                alt={intl.formatMessage({ id: 'COMMON.VIEW' })}
              />
            </Link>
            <Link
              to={`/maintenance/maintenance-type/edit/${info.row.original.id}`}
              className="size-7.5"
            >
              <img
                src={toAbsoluteUrl('/media/icons/edit.svg')}
                alt={intl.formatMessage({ id: 'COMMON.EDIT' })}
              />
            </Link>
            <Menu>
              <MenuItem toggle="dropdown" trigger="click">
                <MenuToggle>
                  <KeenIcon className="text-xl" icon="dots-vertical" />
                </MenuToggle>
                <MenuSub className="menu-default">
                  <MenuItem
                    onClick={() => {
                      handleDelete(info.row.original.id);
                    }}
                  >
                    <MenuLink>
                      <MenuIcon>
                        <img
                          src={toAbsoluteUrl('/media/icons/delete-light.svg')}
                          alt={intl.formatMessage({ id: 'COMMON.DELETE' })}
                        />
                      </MenuIcon>
                      <MenuTitle>
                        <FormattedMessage id="COMMON.DELETE" defaultMessage="Delete" />
                      </MenuTitle>
                    </MenuLink>
                  </MenuItem>
                </MenuSub>
              </MenuItem>
            </Menu>
          </div>
        ),
        meta: {
          className: 'min-w-24'
        }
      }
    ],
    [handleDelete, intl, language.code]
  );

  const filters = useMemo(
    () => [...(searchQuery.trim().length > 2 ? [{ id: '__any', value: searchQuery }] : [])],
    [searchQuery]
  );

  const onFetchData = useCallback((params: any) => getMaintenanceTypes(params), []);

  return (
    <div className="card">
      <div className="flex items-center justify-between p-6">
        <h2 className="text-xl font-semibold text-gray-800">
          <FormattedMessage
            id="MAINTENANCE_TYPE.LIST.TITLE"
            defaultMessage="Maintenance Types List"
          />
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <KeenIcon style="duotone" icon="magnifier" />
          </div>
          <DebouncedSearchInput
            type="search"
            className={`w-64 pl-10 pr-4 py-2 input text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-info focus:border-info`}
            placeholder={intl.formatMessage({ id: 'MAINTENANCE_TYPE.SEARCH.PLACEHOLDER' })}
            onDebounce={setSearchQuery}
          />
        </div>
      </div>

      <DataGrid
        data={[]}
        columns={columns}
        serverSide={true}
        onFetchData={onFetchData}
        filters={filters}
      />
    </div>
  );
};

export { MaintenanceTypeList };
