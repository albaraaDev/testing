import {
  exportSubscriptionExpiryReport,
  getSubscriptionExpiryReport,
  ISubscriptionExpiryReport
} from '@/api/reports';
import { DataGrid } from '@/components';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import { VehicleSearch } from '@/pages/driver/add-driver/blocks/VehicleSearch';
import { ColumnDef } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { downloadFile, toAbsoluteUrl } from '@/utils';
import { useReportFilters } from '@/hooks/useReportFilters';
import { useReportSorting } from '@/hooks/useReportSorting';
import { enqueueSnackbar } from 'notistack';
import { Download, Loader2 } from 'lucide-react';
import { SubscriptionExpiryPeriodSelect } from '../components/SubscriptionExpiryPeriodSelect';
import clsx from 'clsx';
import { useExportLoading } from '../context/ExportLoadingHooks';

const REPORT_ID = 'subscriptionExpiry';

export default function SubscriptionExpirtyReport() {
  const intl = useIntl();
  const { filters, updateFilters, getDataGridFilters } = useReportFilters();
  const { handleFetchWithSort } = useReportSorting({
    defaultSort: 'subscriptionEndDate,asc'
  });
  const [searchClicked, setSearchClicked] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const { isExporting, startExporting, stopExporting, exportingReportId } = useExportLoading();

  const isThisReportExporting = isExporting && exportingReportId === REPORT_ID;
  const isOtherReportExporting = isExporting && exportingReportId !== REPORT_ID;

  const calculateDaysLeft = (endDateStr: string): number => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const endDate = new Date(endDateStr);
    const differenceMs = endDate.getTime() - currentDate.getTime();
    return Math.floor(differenceMs / (1000 * 60 * 60 * 24));
  };

  const handleExport = async () => {
    try {
      startExporting(REPORT_ID);
      const response = await exportSubscriptionExpiryReport({
        pageIndex: 0,
        pageSize: 100
      });
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
    } finally {
      stopExporting();
    }
  };

  const columns = useMemo<ColumnDef<ISubscriptionExpiryReport>[]>(
    () => [
      {
        accessorKey: 'ident',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.IDENTIFY_NUMBER' }),
        enableSorting: true
      },
      {
        accessorKey: 'plate',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.PLATE' }),
        cell: ({ row }) => <CarPlate plate={row.original.plate} />
      },
      {
        accessorKey: 'phone',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.PHONE_NUMBER' })
      },
      {
        accessorKey: 'subscriptionStartDate',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.START_DATE' }),
        enableSorting: true,
        cell: ({ row }) => {
          return row.original.startDate;
        }
      },
      {
        accessorKey: 'subscriptionEndDate',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.END_DATE' }),
        enableSorting: true,
        cell: ({ row }) => {
          return row.original.endDate;
        }
      },
      {
        id: 'daysLeft',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.DAYS_LEFT' }),
        cell: ({ row }) => {
          const daysLeft = calculateDaysLeft(row.original.endDate);
          const isExpired = daysLeft < 0;

          return (
            <span
              className={clsx('font-medium', {
                'text-danger': isExpired,
                'text-success': !isExpired
              })}
            >
              {intl.formatMessage({ id: 'REPORTS.DAYS_LEFT_INFO' }, { days: daysLeft })}
            </span>
          );
        }
      },
      {
        accessorKey: 'protocol',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.PROTOCOL' })
      },
      {
        accessorKey: 'type',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.TYPE' })
      },
      {
        accessorKey: 'user',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.USER' }),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            {row.original.user?.name && (
              <span className="text-nowrap">Name: {row.original.user?.name}</span>
            )}
            {row.original.user?.phone && (
              <span className="text-nowrap">Phone: {row.original.user?.phone}</span>
            )}
          </div>
        )
      },
      {
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.ACTION' }),
        cell: () => (
          <button
            className="p-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#5271FF]/10"
            title={intl.formatMessage({ id: 'VEHICLE.GRID.ACTION.VIEW' })}
          >
            <img
              src={toAbsoluteUrl('/media/icons/view-light.svg')}
              alt={intl.formatMessage({ id: 'COMMON.VIEW' })}
            />
          </button>
        )
      }
    ],
    [intl]
  );

  const dataGridFilters = useMemo(() => getDataGridFilters(), [getDataGridFilters]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchClicked(true);
    const formData = new FormData(e.currentTarget);
    updateFilters({
      vehicleId: formData.get('vehicleId')?.toString() || '',
      ident: formData.get('ident')?.toString() || '',
      plate: formData.get('plate')?.toString() || '',
      period: formData.get('period')?.toString() || ''
    });
  };

  const onFetchData = React.useCallback(
    async (params: any) => {
      if (!searchClicked) return;

      try {
        setIsSearching(true);
        return await handleFetchWithSort(
          params,
          {
            ...filters
          },
          getSubscriptionExpiryReport
        );
      } finally {
        setIsSearching(false);
      }
    },
    [searchClicked, handleFetchWithSort, filters]
  );

  return (
    <>
      <form onSubmit={handleSearch}>
        <div className="flex gap-4 items-center justify-between p-4 w-3/5">
          <div className="grid grid-cols-2 gap-4 grow">
            <VehicleSearch
              key={JSON.stringify(filters)}
              place="bottom"
              initialSearch={
                filters.vehicleId && filters.plate && filters.ident
                  ? {
                      id: filters.vehicleId,
                      plate: filters.plate,
                      ident: filters.ident
                    }
                  : undefined
              }
              required
            />
            <SubscriptionExpiryPeriodSelect />
          </div>
          <button
            className={clsx(
              'flex items-center gap-2 px-3 py-2 text-gray-600 rounded-lg border',
              isThisReportExporting || isOtherReportExporting
                ? 'opacity-60 cursor-not-allowed bg-gray-100'
                : 'hover:bg-gray-50'
            )}
            onClick={handleExport}
            type="button"
            disabled={isThisReportExporting || isOtherReportExporting}
            title={isOtherReportExporting ? 'Another report is being exported' : ''}
          >
            {isThisReportExporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            <span>
              <FormattedMessage id="COMMON.EXPORT" />
            </span>
          </button>
          <button
            type="submit"
            className="btn btn-info w-28 items-center justify-center"
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <span>{intl.formatMessage({ id: 'COMMON.SEARCH' })}</span>
            )}
          </button>
        </div>
      </form>
      <div className="report-table-container">
        <DataGrid
          columns={columns}
          serverSide
          onFetchData={onFetchData}
          key={JSON.stringify(filters)}
          filters={dataGridFilters}
          pagination={{
            size: 100,
            sizes: undefined
          }}
          messages={{
            empty: !filters.ident ? intl.formatMessage({ id: 'COMMON.SELECT_VEHICLE' }) : undefined
          }}
        />
      </div>
    </>
  );
}
