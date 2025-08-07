import { exportMessagesReport, getMaxSpeedReport, IMessagesReports } from '@/api/reports';
import { DataGrid } from '@/components';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import { VehicleSearch } from '@/pages/driver/add-driver/blocks/VehicleSearch';
import { ColumnDef } from '@tanstack/react-table';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { downloadFile } from '@/utils';
import { useReportFilters } from '@/hooks/useReportFilters';
import { useReportSorting } from '@/hooks/useReportSorting';
import { Download, Loader2 } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import MapModal from '../components/MapModal';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import { renderToString } from 'react-dom/server';
import ParkingMarker from '@/pages/replay/components/ParkingMarker';
import L from 'leaflet';
import clsx from 'clsx';
import { useExportLoading } from '../context/ExportLoadingHooks';

const REPORT_ID = 'maxSpeed';

export default function MaxSpeedReport() {
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
            <MaxSpeedMarker
              position={{
                latitude: row.original.positionLatitude,
                longitude: row.original.positionLongitude
              }}
              speed={row.original.positionSpeed}
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
        reportType: 'max_speed'
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
          getMaxSpeedReport
        );
      } finally {
        setIsSearching(false);
      }
    },
    [filters, handleFetchWithSort, searchClicked]
  );

  return (
    <>
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
              max={new Date().toISOString().split('T')[0]}
              defaultValue={filters.startDate}
            />
            <input
              type="date"
              name="endDate"
              className="input"
              placeholder="End Date"
              max={new Date().toISOString().split('T')[0]}
              defaultValue={filters.endDate}
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

type MaxSpeedMarkerProps = {
  position: {
    latitude: number;
    longitude: number;
  };
  speed: number;
};

function MaxSpeedMarker({ position, speed }: MaxSpeedMarkerProps) {
  const map = useMap();

  const createParkingIcon = useCallback(() => {
    const svgString = renderToString(<ParkingMarker color={'#FF0000'} letter="!" />);

    return L.divIcon({
      html: svgString,
      className: '',
      iconSize: [30, 31],
      iconAnchor: [15, 31]
    });
  }, []);

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
    <Marker position={[position.latitude, position.longitude]} icon={createParkingIcon()}>
      <Tooltip
        direction="top"
        offset={[0, -30]}
        permanent
        interactive
        className="bg-white rounded-lg shadow-lg p-2 opacity-100 flex text-center font-semibold text-gray-800 text-md"
      >
        <div className="min-w-36 flex flex-col gap-2">{speed} km/h</div>
      </Tooltip>
    </Marker>
  );
}
