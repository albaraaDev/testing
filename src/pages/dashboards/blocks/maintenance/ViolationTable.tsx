import { getViolations, updateViolationStatus, Violation } from '@/api/cars';
import { DataGrid, useDataGrid } from '@/components';
import { toAbsoluteUrl } from '@/utils';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns/fp';
import { useCallback, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CarView } from '../CarView';
import { StatusDropdown } from '../StatusDropdown';
import { MaintenanceViolationTableProps } from './MaintenanceViolation';

const ViolationStatusDropdown = (info: CellContext<Violation, unknown>) => {
  const intl = useIntl();
  const reload = useDataGrid().fetchServerSideData;
  return (
    <StatusDropdown
      selected={info.row.original.status}
      setSelected={async (value) => {
        await updateViolationStatus(info.row.original.id, value);
        reload();
      }}
      options={{
        unpaid: {
          color: '#F1416C',
          backgroundColor: '#FFF5F8',
          name: intl.formatMessage({ id: 'VIOLATION.STATUS.UNPAID' })
        },
        under_review: {
          color: '#FFA800',
          backgroundColor: '#FFF8EA',
          name: intl.formatMessage({ id: 'VIOLATION.STATUS.UNDER_REVIEW' })
        },
        recorded: {
          color: '#00A3FF',
          backgroundColor: '#EEF9FF',
          name: intl.formatMessage({ id: 'VIOLATION.STATUS.RECORDED' })
        },
        paid: {
          color: '#50CD89',
          backgroundColor: '#EEFAF4',
          name: intl.formatMessage({ id: 'VIOLATION.STATUS.PAID' })
        }
      }}
    />
  );
};

interface ViolationTableProps extends MaintenanceViolationTableProps {
  searchQuery: string;
  context?: 'vehicle' | 'reservation';
}

const ViolationTable = ({ searchQuery, id, context = 'vehicle' }: ViolationTableProps) => {
  const intl = useIntl();
  const columns = useMemo<ColumnDef<Violation>[]>(
    () => [
      {
        accessorFn: (row) => row.user,
        id: 'driver',
        header: () => <FormattedMessage id="DASHBOARD.VIOLATION_TABLE.DRIVER" />,
        cell: (info) => (
          <div className="flex gap-2 items-center">
            <img
              src={
                info.row.original.user?.avatar ||
                toAbsoluteUrl('/media/avatars/avatar-placeholder.png')
              }
              className="size-8 rounded-full aspect-square"
            />
            <span className="text-gray-800 font-bold">{info.row.original.user?.name}</span>
          </div>
        ),
        meta: {
          className: ''
        }
      },
      {
        accessorFn: (row) => row.vehicle,
        id: 'vehicle',
        header: () => <FormattedMessage id="DASHBOARD.VIOLATION_TABLE.CAR" />,
        cell: (info) =>
          info.row.original.vehicle && <CarView vehicle={info.row.original.vehicle} />,
        meta: {
          className: ''
        }
      },
      {
        accessorFn: (row) => row.date,
        id: 'startDate',
        header: () => <FormattedMessage id="DASHBOARD.VIOLATION_TABLE.DATE" />,
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-800 font-bold">
            {format('MMM d, yyyy', info.row.original.date)}
          </span>
        ),
        meta: {
          className: ''
        }
      },
      {
        accessorFn: (row) => row.type,
        id: 'type',
        header: () => <FormattedMessage id="DASHBOARD.VIOLATION_TABLE.TYPE" />,
        enableSorting: true,
        cell: (info) => <span className="text-gray-800 font-bold">{info.row.original.type}</span>,
        meta: {
          className: ''
        }
      },
      {
        accessorFn: (row) => row.price,
        id: 'amount',
        header: () => <FormattedMessage id="DASHBOARD.VIOLATION_TABLE.PRICE" />,
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-800 font-bold">
            {intl.formatNumber(info.row.original.price, {
              style: 'currency',
              currency: 'TRY'
            })}
          </span>
        )
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: () => <FormattedMessage id="DASHBOARD.VIOLATION_TABLE.STATUS" />,
        enableSorting: true,
        cell: (info) => <ViolationStatusDropdown {...info} />,
        meta: {
          className: 'min-w-40'
        }
      },
      {
        id: 'actions',
        header: () => <FormattedMessage id="DASHBOARD.VIOLATION_TABLE.ACTIONS" />,
        cell: (info) => (
          <div className="flex gap-3">
            <a href="#">
              <img src={toAbsoluteUrl('/media/icons/view.svg')} />
            </a>
            <a href="#">
              <img src={toAbsoluteUrl('/media/icons/edit.svg')} />
            </a>
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

  const onFetchData = useCallback((params: any) => getViolations(params, context), [context]);

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

export { ViolationTable };
