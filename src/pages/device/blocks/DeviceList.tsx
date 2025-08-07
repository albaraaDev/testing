import { useCallback, useMemo, useState, useRef } from 'react';
import { deleteDevice, DeviceDTO, exportDevicesIntoExcel, getDevices } from '@/api/devices';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import DeviceIcon from '../svg/device.svg?react';
import DebouncedSearchInput from '@/components/DebouncedInputField';
import {
  DataGrid,
  KeenIcon,
  Menu,
  MenuIcon,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuToggle,
  TDataGridRequestParams
} from '@/components';
import RoleComponent from '@/components/RoleComponent';
import { ColumnDef } from '@tanstack/react-table';
import { downloadFile, toAbsoluteUrl } from '@/utils';
import { useDeviceProvider } from '@/providers/DeviceProvider';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router';
import { useDialogs } from '@toolpad/core/useDialogs';
import { Download } from 'lucide-react';

type DeviceListProps = {
  refetchStats?: () => void;
  userId?: string;
};

const DeviceList = ({ refetchStats: refetch, userId }: DeviceListProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();
  const [searchQuery, setSearchQuery] = useState('');
  const { getProtocolName, getTypeName } = useDeviceProvider();
  const intl = useIntl();
  const currentGridParamsRef = useRef<TDataGridRequestParams>({
    pageIndex: 0,
    pageSize: 10,
    filters: [],
    sorting: []
  });

  const columns = useMemo<ColumnDef<DeviceDTO>[]>(
    () => [
      {
        accessorKey: 'ident',
        header: intl.formatMessage({ id: 'DEVICE.LIST.GRID.IMEI' }),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-4">
            <DeviceIcon color="#5151F9" className="size-12 min-w-12" />
            <div>
              <p className="text-lg text-gray-700 font-monospace">{row.original.ident}</p>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'vehiclePlate',
        header: intl.formatMessage({ id: 'DEVICE.LIST.GRID.PLATE' }),
        enableSorting: true,
        cell: ({ row }) => <CarPlate plate={row.original.vehiclePlate} />
      },
      {
        accessorKey: 'phone',
        header: intl.formatMessage({ id: 'DEVICE.LIST.GRID.PHONE' }),
        enableSorting: true,
        cell: ({ row }) => (
          <span dir="ltr">
            {row.original.phoneCode} {row.original.phone}
          </span>
        )
      },
      {
        accessorKey: 'protocolId',
        header: intl.formatMessage({ id: 'DEVICE.LIST.GRID.PROTOCOL' }),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col gap-2">
            <span>
              <FormattedMessage id="DEVICE.LIST.GRID.PROTOCOL_TYPE" />:{' '}
              {getProtocolName(row.original.protocolId)}
            </span>
            <span>
              <FormattedMessage id="DEVICE.LIST.GRID.DEVICE_TYPE" />:{' '}
              {getTypeName(row.original.typeId)}
            </span>
          </div>
        )
      },
      {
        accessorKey: 'subscriptionStartDate',
        header: intl.formatMessage({ id: 'DEVICE.LIST.GRID.SUBSCRIPTION' }),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col gap-2">
            <span>
              <FormattedMessage id="COMMON.START" />: {row.original.subscriptionStartDate}
            </span>
            <span>
              <FormattedMessage id="COMMON.END" />: {row.original.subscriptionEndDate}
            </span>
          </div>
        )
      },
      {
        id: 'actions',
        header: intl.formatMessage({ id: 'COMMON.ACTIONS' }),
        cell: ({ row }) => (
          <div className="flex gap-3">
            <Link to={`/devices/device/${row.original.ident}`} className="size-7.5">
              <img
                src={toAbsoluteUrl('/media/icons/view.svg')}
                alt={intl.formatMessage({ id: 'COMMON.VIEW' })}
              />
            </Link>
            <RoleComponent role={['ADMIN', 'SUPER_ADMIN', 'MANAGER']}>
              <Link to={`/devices/edit/${row.original.id}`} className="size-7.5">
                <img
                  src={toAbsoluteUrl('/media/icons/edit.svg')}
                  alt={intl.formatMessage({ id: 'COMMON.EDIT' })}
                  className="size-7.5"
                />
              </Link>
              <Menu>
                <MenuItem toggle="dropdown" trigger="click">
                  <MenuToggle>
                    <KeenIcon className="text-xl" icon="dots-vertical" />
                  </MenuToggle>
                  <MenuSub className="menu-default">
                    <MenuItem
                      onClick={async () => {
                        if (
                          !(await dialogs.confirm(
                            intl.formatMessage({
                              id: 'DEVICE.DELETE.MODAL_MESSAGE'
                            }),
                            {
                              title: intl.formatMessage({ id: 'DEVICE.DELETE.MODAL_TITLE' }),
                              okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
                              cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
                            }
                          ))
                        )
                          return;
                        const deleteRes = await deleteDevice(row.original.id);
                        enqueueSnackbar(deleteRes.message, {
                          variant: 'success'
                        });
                        refetch?.();
                      }}
                    >
                      <MenuLink>
                        <MenuIcon>
                          <img src={toAbsoluteUrl('/media/icons/delete-light.svg')} />
                        </MenuIcon>
                        <MenuTitle>
                          <FormattedMessage id="COMMON.DELETE" />
                        </MenuTitle>
                      </MenuLink>
                    </MenuItem>
                  </MenuSub>
                </MenuItem>
              </Menu>
            </RoleComponent>
          </div>
        )
      }
    ],
    [dialogs, enqueueSnackbar, getProtocolName, getTypeName, intl, refetch]
  );

  const filters = useMemo(
    () => [
      ...(searchQuery.trim().length > 2 ? [{ id: '__any', value: searchQuery }] : []),
      ...(userId ? [{ id: 'userId', value: userId }] : [])
    ],
    [searchQuery, userId]
  );

  const handleExport = async () => {
    try {
      const exportParams = {
        ...currentGridParamsRef.current,
        filters: [
          ...(currentGridParamsRef.current.filters || []),
          ...(searchQuery.trim().length > 2 ? [{ id: '__any', value: searchQuery }] : []),
          ...(userId ? [{ id: 'userId', value: userId }] : [])
        ]
      };

      const response = await exportDevicesIntoExcel(exportParams);

      downloadFile(response);

      enqueueSnackbar(
        intl.formatMessage(
          { id: 'COMMON.EXPORT_SUCCESS' },
          { defaultMessage: 'Export successful' }
        ),
        {
          variant: 'success'
        }
      );
    } catch (error) {
      console.error('Export error:', error);
      enqueueSnackbar(
        intl.formatMessage(
          { id: 'COMMON.EXPORT_ERROR' },
          { defaultMessage: 'Failed to export devices' }
        ),
        {
          variant: 'error'
        }
      );
    }
  };

  const onFetchData = useCallback((params: TDataGridRequestParams) => {
    currentGridParamsRef.current = params;
    return getDevices(params);
  }, []);

  return (
    <div className="card">
      <div className="flex items-center justify-between p-6 ">
        <h2 className="text-xl font-semibold text-gray-800">
          <FormattedMessage id="DEVICE.LIST.TITLE" />
        </h2>
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border"
            onClick={handleExport}
            type="button"
          >
            <Download size={16} />
            <span>
              <FormattedMessage id="COMMON.EXPORT" />
            </span>
          </button>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <KeenIcon style="duotone" icon="magnifier" />
            </div>
            <DebouncedSearchInput
              type="search"
              className="w-64 pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-info focus:border-info input"
              placeholder={intl.formatMessage({ id: 'COMMON.SEARCH' })}
              onDebounce={setSearchQuery}
            />
          </div>
        </div>
      </div>
      <div className="driver-table">
        <DataGrid
          columns={columns}
          data={[]}
          serverSide={true}
          onFetchData={onFetchData}
          filters={filters}
        />
      </div>
    </div>
  );
};

export { DeviceList };
