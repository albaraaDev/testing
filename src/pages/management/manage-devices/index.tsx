import { Paginated } from '@/api/common';
import {
  DeviceDTO,
  exportDevicesIntoExcel,
  getDevices,
  importDevicesFromExcel
} from '@/api/devices';
import { DataGrid, TDataGridRequestParams } from '@/components';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import { DeviceMutationModal } from '@/pages/management/blocks/DeviceMutationModal';
import { DeviceUserModal } from '@/pages/management/blocks/DeviceUserModal';
import DebouncedSearchInput from '@/components/DebouncedInputField';
import { useDeviceProvider } from '@/providers/DeviceProvider';
import { downloadFile, toAbsoluteUrl } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Upload } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

export default function ManageDevices() {
  const intl = useIntl();
  const [searchQuery, setSearchQuery] = useState('');
  const [devices, setDevices] = useState<Paginated<DeviceDTO>>();
  const { getProtocolName, getTypeName } = useDeviceProvider();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const currentGridParamsRef = useRef<TDataGridRequestParams>({
    pageIndex: 0,
    pageSize: 100,
    filters: [],
    sorting: []
  });

  const fetchDevices = useCallback((params = { pageIndex: 0, pageSize: 1 }) => {
    return getDevices({
      ...params
    }).then((data) => {
      setDevices(data);
      return data;
    });
  }, []);

  useEffect(() => {
    if (isInitialLoad) {
      fetchDevices();
      setIsInitialLoad(false);
    }
  }, [fetchDevices, isInitialLoad]);

  const handleFetchData = useCallback((params: TDataGridRequestParams) => {
    currentGridParamsRef.current = params;
    return getDevices(params);
  }, []);

  const handleExport = async () => {
    try {
      const exportParams = {
        ...currentGridParamsRef.current
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

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await importDevicesFromExcel(formData);
      enqueueSnackbar(res.message, {
        variant: 'success'
      });
      fetchDevices();
    } catch (error) {
      console.error('Import error:', error);
      enqueueSnackbar(
        intl.formatMessage(
          { id: 'COMMON.IMPORT_ERROR' },
          { defaultMessage: 'Failed to import devices' }
        ),
        {
          variant: 'error'
        }
      );
    } finally {
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const columns = useMemo<ColumnDef<DeviceDTO>[]>(
    () => [
      {
        accessorKey: 'ident',
        enableSorting: true,
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.IDENTIFY_NUMBER' })
      },
      {
        accessorKey: 'phone',
        enableSorting: true,
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.PHONE' })
      },
      {
        accessorKey: 'protocolId',
        enableSorting: true,
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.PROTOCOL' }),
        cell: ({ row }) => getProtocolName(row.original.protocolId)
      },
      {
        accessorKey: 'typeId',
        enableSorting: true,
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.TYPE' }),
        cell: ({ row }) => getTypeName(row.original.typeId)
      },
      {
        accessorKey: 'vehiclePlate',
        enableSorting: true,
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.PLATE' }),
        cell: ({ row }) => <CarPlate plate={row.original.vehiclePlate} />
      },
      {
        accessorKey: 'installationStatus',
        enableSorting: true,
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.INSTALLATION_STATUS' }),
        cell: ({ row }) => (row.original.installationStatus ? row.original.installationStatus : '-')
      },
      {
        accessorKey: 'installationDate',
        enableSorting: true,
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.INSTALLATION_DATE' }),
        cell: ({ row }) => (row.original.installationDate ? row.original.installationDate : '-')
      },
      {
        accessorKey: 'distributor',
        enableSorting: true,
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.DISTRIBUTOR' }),
        cell: ({ row }) => (row.original.distributorName ? row.original.distributorName : '-')
      },
      {
        accessorKey: 'currentMileage',
        enableSorting: true,
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.ODOMETER' }),
        cell: ({ row }) => (row.original.currentMileage ? row.original.currentMileage : '-')
      },
      {
        accessorKey: 'subscriptionStartDate',
        enableSorting: true,
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.START_DATE' })
      },
      {
        accessorKey: 'subscriptionEndDate',
        enableSorting: true,
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.END_DATE' })
      },
      {
        header: intl.formatMessage({ id: 'COMMON.ACTIONS' }),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <DeviceUserModal deviceIdent={row.original.ident} userId={row.original.userId} />
            <DeviceMutationModal
              device={row.original}
              onSuccess={() => {
                fetchDevices();
              }}
              renderActionButton={(open) => (
                <button
                  type="button"
                  className="p-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#50CD89]/10"
                  title={intl.formatMessage({ id: 'COMMON.EDIT' })}
                  onClick={open}
                >
                  <img
                    src={toAbsoluteUrl('/media/icons/edit-light.svg')}
                    alt={intl.formatMessage({ id: 'COMMON.EDIT' })}
                  />
                </button>
              )}
            />
          </div>
        )
      }
    ],
    [intl, getProtocolName, getTypeName, fetchDevices]
  );

  return (
    <>
      <Toolbar>
        <ToolbarHeading
          title={<FormattedMessage id="SIDEBAR.MENU.MANAGEMENT" />}
          description={<FormattedMessage id="MANAGEMENT.DEVICES.TOOLBAR.DESCRIPTION" />}
        />
      </Toolbar>

      <div className="card">
        <div className="flex justify-between items-center p-4">
          <h2 className="font-semibold">
            <FormattedMessage
              id="MANAGEMENT.DEVICES.DEVICE_COUNT"
              values={{ count: devices?.totalCount ?? 0 }}
            />
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="file"
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                id="importFile"
                accept=".xlsx,.xls"
                onChange={handleImport}
              />
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border"
                onClick={() => document.getElementById('importFile')?.click()}
              >
                <Upload size={16} />
                <span>
                  <FormattedMessage id="COMMON.IMPORT" />
                </span>
              </button>
            </div>

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

            <DeviceMutationModal
              onSuccess={() => {
                fetchDevices();
              }}
              renderActionButton={(open) => (
                <button
                  type="button"
                  className="btn btn-success w-full flex items-center justify-center"
                  onClick={open}
                >
                  <FormattedMessage id="COMMON.ADD" />
                </button>
              )}
            />

            <DebouncedSearchInput
              onDebounce={setSearchQuery}
              placeholder={intl.formatMessage({ id: 'COMMON.SEARCH' })}
              className="w-64 py-2 text-sm border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-info focus:border-info input"
            />
          </div>
        </div>
        <div className="report-table-container">
          <DataGrid
            columns={columns}
            serverSide={true}
            onFetchData={handleFetchData}
            pagination={{ size: 100, sizes: undefined }}
            filters={[
              ...(searchQuery.trim().length > 2 ? [{ id: '__any', value: searchQuery }] : [])
            ]}
          />
        </div>
      </div>
    </>
  );
}
