import { exportWorkingHourReport, getWorkingHourReport, IWorkingHourReport } from '@/api/reports';
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
import clsx from 'clsx';
import { useExportLoading } from '../context/ExportLoadingHooks';

const PAGE_LIMIT = 100;
const REPORT_ID = 'workingHour';

export default function WorkingHourReport() {
  const intl = useIntl();
  const { filters, updateFilters, getDataGridFilters } = useReportFilters();
  const [searchClicked, setSearchClicked] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const { isExporting, startExporting, stopExporting, exportingReportId } = useExportLoading();

  const isThisReportExporting = isExporting && exportingReportId === REPORT_ID;
  const isOtherReportExporting = isExporting && exportingReportId !== REPORT_ID;

  const { handleFetchWithSort } = useReportSorting({
    defaultSort: 'createdAt,desc'
  });

  const onFetchData = React.useCallback(
    async (params: any) => {
      if (!searchClicked) return;
      if (!filters.vehicleId) return;

      try {
        setIsSearching(true);
        const res = await handleFetchWithSort(
          params,
          {
            ...filters,
            workingHourCode: filters.type
          },
          getWorkingHourReport
        );

        return res;
      } finally {
        setIsSearching(false);
      }
    },
    [filters, handleFetchWithSort, searchClicked]
  );

  const handleExport = async () => {
    if (isExporting) return;

    try {
      startExporting(REPORT_ID);
      const response = await exportWorkingHourReport({
        pageIndex: 0,
        pageSize: PAGE_LIMIT,
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
        startTime: filters.startTime || '',
        endTime: filters.endTime || '',
        sort: 'ident,desc',
        ident: filters.ident || ''
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

  const columns = useMemo<ColumnDef<IWorkingHourReport>[]>(
    () => [
      {
        accessorKey: 'ident',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.IDENTIFY_NUMBER' }),
        enableSorting: true
      },
      {
        accessorKey: 'plate',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.PLATE' }),
        enableSorting: true,
        cell: ({ row }) => <CarPlate plate={row.original.plate} />
      },
      {
        accessorKey: 'date',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.DATE' }),
        enableSorting: true
      },
      {
        accessorKey: 'formattedDurationHours',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.DURATION_ON_HOURS' })
      },
      {
        accessorKey: 'formattedOffDurationHours',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.DURATION_OFF_HOURS' })
      },
      {
        accessorKey: 'formattedDistanceKm',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.DISTANCE_ON_HOURS' })
      },
      {
        accessorKey: 'formattedOffDistanceKm',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.DISTANCE_OFF_HOURS' })
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
      startDate: formData.get('startDate')?.toString() || '',
      endDate: formData.get('endDate')?.toString() || '',
      type: formData.get('workingHourCode')?.toString() || ''
    });
  };

  return (
    <>
      <form onSubmit={handleSearch}>
        <div className="flex gap-4 items-center justify-between p-4 w-[90.5%]">
          <div className="grid grid-cols-4 gap-4 grow">
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
            <input
              type="date"
              name="startDate"
              className="input"
              placeholder="Start Date"
              max={new Date().toISOString().split('T')[0]}
              defaultValue={filters.startDate}
              required
            />
            <input
              type="date"
              name="endDate"
              className="input"
              placeholder="End Date"
              max={new Date().toISOString().split('T')[0]}
              defaultValue={filters.endDate}
            />
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
          filters={dataGridFilters}
          messages={{
            empty: !filters.ident ? intl.formatMessage({ id: 'COMMON.SELECT_VEHICLE' }) : undefined
          }}
        />
      </div>
    </>
  );
}
