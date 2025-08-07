import {
  getMaintenance,
  IMaintenanceTableData,
  updateMaintenanceStatus
} from '@/api/maintenance.ts';
import { DataGrid, useDataGrid } from '@/components';
import { toAbsoluteUrl } from '@/utils';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns/fp';
import { useCallback, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router';
import { CarView } from '../CarView';
import { StatusDropdown } from '../StatusDropdown';
import { MaintenanceViolationTableProps } from './MaintenanceViolation';

const MaintenanceStatusDropdown = (info: CellContext<IMaintenanceTableData, unknown>) => {
  const intl = useIntl();
  const reload = useDataGrid().fetchServerSideData;
  return (
    <StatusDropdown
      selected={info.row.original.status}
      setSelected={async (value) => {
        await updateMaintenanceStatus(info.row.original.id, value);
        reload();
      }}
      options={{
        ongoing: {
          color: '#FFA800',
          backgroundColor: '#FFF8EA',
          name: intl.formatMessage({ id: 'MAINTENANCE.STATUS.ONGOING' })
        },
        finished: {
          color: '#50CD89',
          backgroundColor: '#EEFAF4',
          name: intl.formatMessage({ id: 'MAINTENANCE.STATUS.FINISHED' })
        }
      }}
    />
  );
};

interface ViolationTableProps extends MaintenanceViolationTableProps {
  searchQuery: string;
  context?: 'vehicle' | 'reservation';
}

const MaintenanceTable = ({ searchQuery, id, context = 'vehicle' }: ViolationTableProps) => {
  const intl = useIntl();
  const columns = useMemo<ColumnDef<IMaintenanceTableData>[]>(
    () => [
      {
        accessorFn: (row) => row.startDate,
        id: 'startDate',
        header: () => <FormattedMessage id="DASHBOARD.MAINTENANCE_TABLE.DATE" />,
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-800 font-bold">
            {format('MMM d, yyyy', info.row.original.startDate)}
          </span>
        ),
        meta: {
          className: ''
        }
      },
      {
        accessorFn: (row) => row.vehicleId,
        id: 'vehicle',
        header: () => <FormattedMessage id="DASHBOARD.MAINTENANCE_TABLE.CAR" />,
        cell: (info) =>
          info.row.original.vehicleId && (
            <CarView
              vehicle={{
                id: info.row.original.vehicleId,
                name: info.row.original.vehicleName,
                plate: info.row.original.vehiclePlate,
                imei: '',
                brandImage: ''
              }}
            />
          ),
        meta: {
          className: ''
        }
      },
      {
        accessorFn: (row) => row.type,
        id: 'type',
        header: () => <FormattedMessage id="DASHBOARD.MAINTENANCE_TABLE.TYPE" />,
        enableSorting: true,
        cell: (info) => <span className="text-gray-800 font-bold">{info.row.original.type}</span>,
        meta: {
          className: ''
        }
      },
      {
        accessorFn: (row) => row.supplier,
        id: 'supplier',
        header: () => <FormattedMessage id="DASHBOARD.MAINTENANCE_TABLE.SUPPLIER" />,
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-800 font-bold">{info.row.original.supplier}</span>
        ),
        meta: {
          className: ''
        }
      },
      {
        accessorFn: (row) => row.amount,
        id: 'amount',
        header: () => <FormattedMessage id="DASHBOARD.MAINTENANCE_TABLE.PRICE" />,
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-800 font-bold">
            {intl.formatNumber(info.row.original.amount, {
              style: 'currency',
              currency: 'TRY'
            })}
          </span>
        )
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: () => <FormattedMessage id="DASHBOARD.MAINTENANCE_TABLE.STATUS" />,
        enableSorting: true,
        cell: (info) => <MaintenanceStatusDropdown {...info} />,
        meta: {
          className: 'min-w-44'
        }
      },
      {
        id: 'actions',
        header: () => <FormattedMessage id="DASHBOARD.MAINTENANCE_TABLE.ACTIONS" />,
        cell: (info) => (
          <div className="flex gap-3">
            <Link to={`/maintenance/view/${info.row.original.id}`} className="size-7.5">
              <img src={toAbsoluteUrl('/media/icons/view.svg')} alt="View" />
            </Link>
            <Link to={`/maintenance/edit/${info.row.original.id}`} className="size-7.5">
              <img src={toAbsoluteUrl('/media/icons/edit.svg')} alt="Edit" />
            </Link>
          </div>
        ),
        meta: {
          className: ''
        }
      }
    ],
    [intl]
  );

  const filters = useMemo(() => {
    const baseFilters = [
      ...(searchQuery.trim().length > 2 ? [{ id: '__any', value: searchQuery }] : [])
    ];

    if (id) {
      if (context === 'reservation') {
        baseFilters.push({ id: 'reservationId', value: id });
      } else {
        baseFilters.push({ id: 'vehicleId', value: id });
      }
    }

    return baseFilters;
  }, [searchQuery, id, context]);

  const onFetchData = useCallback((params: any) => getMaintenance(params, context), [context]);

  return (
    <DataGrid
      columns={columns}
      filters={filters}
      serverSide={true}
      onFetchData={onFetchData}
      pagination={{ sizes: [], size: 4 }}
    />
  );
};

export { MaintenanceTable };
