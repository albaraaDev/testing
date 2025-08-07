import { exportMessagesReport, getMessagesReport, IMessagesReports } from '@/api/reports';
import { DataGrid } from '@/components';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import { VehicleSearch } from '@/pages/driver/add-driver/blocks/VehicleSearch';
import { ColumnDef } from '@tanstack/react-table';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { downloadFile, toAbsoluteUrl } from '@/utils';
import { useReportFilters } from '@/hooks/useReportFilters';
import { useReportSorting } from '@/hooks/useReportSorting';
import { Download, Loader2 } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import MapModal from '../components/MapModal';
import { Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RotatableMarker } from '@/pages/monitoring/blocks/RotatableMarker';
import clsx from 'clsx';
import { useExportLoading } from '../context/ExportLoadingHooks';

const REPORT_ID = 'messages';

interface MessagesReportFormProps {
  filters: any;
  handleSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  handleExport: () => void;
}

function MessagesReportForm({
  filters,
  handleSearch,
  handleExport,
  isLoading,
  isDisabled,
  isSearching
}: MessagesReportFormProps & { isLoading: boolean; isDisabled: boolean; isSearching: boolean }) {
  const intl = useIntl();
  const [startDate, setStartDate] = useState<string>(filters.startDate || '');
  const [endDate, setEndDate] = useState<string>(filters.endDate || '');

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    if (endDate) {
      const start = new Date(newStartDate);
      const end = new Date(endDate);
      const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 2) {
        const maxEnd = new Date(start);
        maxEnd.setDate(start.getDate() + 2);
        setEndDate(maxEnd.toISOString().split('T')[0]);
      }
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(newEndDate);
      const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 2) {
        const minStart = new Date(end);
        minStart.setDate(end.getDate() - 2);
        setStartDate(minStart.toISOString().split('T')[0]);
      }
    }
  };

  const getMaxEndDate = () => {
    if (!startDate) return new Date().toISOString().split('T')[0];

    const start = new Date(startDate);
    const maxDate = new Date(start);
    maxDate.setDate(start.getDate() + 2);

    const today = new Date();
    return maxDate > today
      ? today.toISOString().split('T')[0]
      : maxDate.toISOString().split('T')[0];
  };

  const getMinStartDate = () => {
    if (!endDate) return '';

    const end = new Date(endDate);
    const minDate = new Date(end);
    minDate.setDate(end.getDate() - 2);

    return minDate.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="flex gap-4 items-center justify-between p-4 w-full">
        <div className="grid grid-cols-5 gap-4 grow">
          <div className="relative">
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
          </div>
          <input
            type="date"
            name="startDate"
            className="input"
            placeholder="Start Date"
            max={endDate || new Date().toISOString().split('T')[0]}
            min={getMinStartDate()}
            value={startDate}
            onChange={handleStartDateChange}
          />
          <input
            type="date"
            name="endDate"
            className="input"
            placeholder="End Date"
            min={startDate || ''}
            max={getMaxEndDate()}
            value={endDate}
            onChange={handleEndDateChange}
          />
          <input
            type="time"
            name="startTime"
            className="input"
            placeholder="Start Time"
            defaultValue={filters.startTime}
          />
          <input
            type="time"
            name="endTime"
            className="input"
            placeholder="End Time"
            defaultValue={filters.endTime}
          />
        </div>
        <button
          className={clsx(
            'flex items-center gap-2 px-3 py-2 text-gray-600 rounded-lg border',
            isDisabled || isLoading
              ? 'opacity-60 cursor-not-allowed bg-gray-100'
              : 'hover:bg-gray-50'
          )}
          onClick={handleExport}
          type="button"
          disabled={isDisabled || isLoading}
          title={isDisabled ? 'Another report is being exported' : ''}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
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
  );
}

export default function MessagesReport() {
  const intl = useIntl();
  const { filters, updateFilters, getDataGridFilters } = useReportFilters();
  const [searchClicked, setSearchClicked] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const { handleFetchWithSort } = useReportSorting({
    defaultSort: 'ident,desc'
  });
  const { isExporting, startExporting, stopExporting, exportingReportId } = useExportLoading();

  const isThisReportExporting = isExporting && exportingReportId === REPORT_ID;
  const isOtherReportExporting = isExporting && exportingReportId !== REPORT_ID;

  const onFetchData = React.useCallback(
    async (params: any) => {
      if (!searchClicked) return;
      if (!filters.ident) return;

      try {
        setIsSearching(true);
        return await handleFetchWithSort(
          params,
          {
            ...filters,
            intervalType: filters.type
          },
          getMessagesReport
        );
      } finally {
        setIsSearching(false);
      }
    },
    [filters, handleFetchWithSort, searchClicked]
  );

  const columns = useMemo<ColumnDef<IMessagesReports>[]>(
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
        accessorKey: 'timestamp',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.TIMESTAMP' }),
        enableSorting: true
      },
      {
        accessorKey: 'ignitionStatus',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.IGNITION_STATUS' }),
        cell: ({ row }) => {
          const status = row.original.ignitionStatus ? 'On' : 'Off';
          return <span>{status}</span>;
        }
      },
      {
        accessorKey: 'positionSpeed',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.SPEED' })
      },
      {
        accessorKey: 'positionLatitude',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.LATITUDE' })
      },
      {
        accessorKey: 'positionLongitude',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.LONGITUDE' })
      },
      {
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.ACTION' }),
        cell: ({ row }) => (
          <MapModal>
            <MessageMarker
              position={{
                latitude: row.original.positionLatitude,
                longitude: row.original.positionLongitude
              }}
              speed={row.original.positionSpeed}
              direction={row.original.positionDirection}
            />
          </MapModal>
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
      type: formData.get('intervalType')?.toString() || '',
      startTime: formData.get('startTime')?.toString() || '',
      endTime: formData.get('endTime')?.toString() || ''
    });
  };

  const handleExport = async () => {
    try {
      startExporting(REPORT_ID);
      const response = await exportMessagesReport({
        pageIndex: 0,
        pageSize: 0,
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
        startTime: filters.startTime || '',
        endTime: filters.endTime || '',
        sort: 'ident,desc',
        ident: filters.ident || '',
        reportType: REPORT_ID
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

  return (
    <>
      <MessagesReportForm
        filters={filters}
        handleSearch={handleSearch}
        handleExport={handleExport}
        isLoading={isThisReportExporting}
        isDisabled={isOtherReportExporting}
        isSearching={isSearching}
      />

      <div className="report-table-container">
        <DataGrid
          columns={columns}
          serverSide
          onFetchData={onFetchData}
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

type MessageMarkerProps = {
  position: {
    latitude: number;
    longitude: number;
  };
  speed: number;
  direction: number;
};

function MessageMarker({ position, speed, direction }: MessageMarkerProps) {
  const map = useMap();

  const icon = useMemo(
    () =>
      L.icon({
        iconUrl: toAbsoluteUrl('/media/icons/car-marker-green.png'),
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      }),
    []
  );

  useEffect(() => {
    if (position && position.latitude && position.longitude) {
      map.setView([position.latitude, position.longitude], 15);
    }
  }, [position, map]);

  if (
    !position ||
    typeof position.latitude !== 'number' ||
    typeof position.longitude !== 'number'
  ) {
    return null;
  }

  return (
    <>
      <RotatableMarker
        position={{
          lat: position.latitude,
          lng: position.longitude
        }}
        icon={icon}
        rotationAngle={direction}
      >
        <Tooltip
          direction="top"
          offset={[0, -10]}
          permanent
          interactive
          className="bg-white rounded-lg shadow-lg p-2 opacity-100 flex text-center font-semibold text-gray-800 text-md"
        >
          <div className="min-w-36 flex flex-col gap-2">{speed} km/h</div>
        </Tooltip>
      </RotatableMarker>
    </>
  );
}
