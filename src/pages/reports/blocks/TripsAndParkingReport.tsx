import {
  exportTripsAndParkingReport,
  getTripsAndParkingReport,
  ITripsAndParkingReport
} from '@/api/reports';
import { DataGrid } from '@/components';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import { VehicleSearch } from '@/pages/driver/add-driver/blocks/VehicleSearch';
import { ColumnDef } from '@tanstack/react-table';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { downloadFile, toAbsoluteUrl } from '@/utils';
import { formatInTimeZone } from 'date-fns-tz';
import { IntervalType, TripPoint } from '@/api/trips';
import { useAuthContext } from '@/auth';
import { useReportFilters } from '@/hooks/useReportFilters';
import { useReportSorting } from '@/hooks/useReportSorting';
import { Download, Loader2 } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import MapModal from '../components/MapModal';
import { Marker, Polyline, useMap } from 'react-leaflet';
import { renderToString } from 'react-dom/server';
import ParkingMarker from '@/pages/replay/components/ParkingMarker';
import L, { LatLngExpression } from 'leaflet';
import { useExportLoading } from '../context/ExportLoadingHooks';
import clsx from 'clsx';

const IntervalTypeOptions = [
  { label: 'Trip', value: IntervalType.Trip },
  { label: 'Parking', value: IntervalType.Parking }
];

const REPORT_ID = 'TripsAndParkingReport';

export default function TripsAndParkingReport() {
  const intl = useIntl();
  const { currentUser } = useAuthContext();
  const { filters, updateFilters, getDataGridFilters } = useReportFilters();
  const [searchClicked, setSearchClicked] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const { handleFetchWithSort } = useReportSorting({
    defaultSort: 'startTime,desc'
  });
  const { isExporting, startExporting, stopExporting, exportingReportId } = useExportLoading();

  const isThisReportExporting = isExporting && exportingReportId === REPORT_ID;
  const isOtherReportExporting = isExporting && exportingReportId !== REPORT_ID;

  const onFetchData = React.useCallback(
    async (params: any) => {
      if (!searchClicked) return;
      if (!filters.vehicleId) return;

      try {
        setIsSearching(true);
        return await handleFetchWithSort(
          params,
          {
            ...filters,
            intervalType: filters.type
          },
          getTripsAndParkingReport
        );
      } finally {
        setIsSearching(false);
      }
    },
    [filters, handleFetchWithSort, searchClicked]
  );

  const handleExport = async () => {
    try {
      startExporting(REPORT_ID);
      const response = await exportTripsAndParkingReport({
        pageIndex: 0,
        pageSize: 100,
        intervalType: filters.type as IntervalType,
        vehicleId: filters.vehicleId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        sort: 'startTime,desc'
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

  const columns = useMemo<ColumnDef<ITripsAndParkingReport>[]>(
    () => [
      {
        accessorKey: 'ident',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.IDENTIFY_NUMBER' }),
        enableSorting: true
      },
      {
        accessorKey: 'vehiclePlate',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.PLATE' }),
        enableSorting: true,
        cell: ({ row }) => <CarPlate plate={row.original.vehiclePlate} />
      },
      {
        accessorKey: 'startTime',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.START_DATE' }),
        enableSorting: true,
        cell: ({ row }) =>
          formatInTimeZone(
            new Date(+row.original.startTime * 1000),
            currentUser!.timezone,
            'yyyy/MM/dd HH:mm:ss'
          )
      },
      {
        accessorKey: 'endTime',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.END_DATE' }),
        cell: ({ row }) =>
          formatInTimeZone(
            new Date(+row.original.endTime * 1000),
            currentUser!.timezone,
            'yyyy/MM/dd HH:mm:ss'
          )
      },
      {
        accessorKey: 'formatedTotalDuration',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.DURATION' })
      },
      {
        accessorKey: 'formatedMaxSpeed',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.MAX_SPEED' })
      },
      {
        accessorKey: 'foramtedTotalDistance',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.MILEAGE' })
      },
      {
        accessorKey: 'intervalType',
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.TYPE' })
      },
      {
        header: intl.formatMessage({ id: 'REPORTS.COLUMN.ACTION' }),
        cell: ({ row }) => (
          <MapModal>
            {row.original.intervalType === 'Parking' && (
              <ParkingIntervalMarker
                position={{
                  latitude: row.original.startLatitude,
                  longitude: row.original.startLongitude
                }}
              />
            )}
            {row.original.intervalType === 'Trip' && (
              <TripIntervalLayer pointsList={row.original.pointsList} />
            )}
          </MapModal>
        )
      }
    ],
    [intl, currentUser]
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
      type: formData.get('intervalType')?.toString() || ''
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
            <select name="intervalType" className="select" defaultValue={filters.type}>
              <option key="ALL" value="">
                All
              </option>
              {IntervalTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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

type ParkingIntervalMarkerProps = {
  position: {
    latitude: number;
    longitude: number;
  };
};

function ParkingIntervalMarker({ position }: ParkingIntervalMarkerProps) {
  const map = useMap();

  const createParkingIcon = useCallback(() => {
    const svgString = renderToString(<ParkingMarker color={'#FF0000'} />);

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

  return <Marker position={[position.latitude, position.longitude]} icon={createParkingIcon()} />;
}

type TripIntervalMarkerProps = {
  pointsList: TripPoint[];
};

function TripIntervalLayer({ pointsList }: TripIntervalMarkerProps) {
  const map = useMap();
  const route: LatLngExpression[] = pointsList
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((point) => [point.latitude, point.longitude]);
  const bounds = L.latLngBounds(route);
  const startPoint = route[0];
  const endPoint = route[route.length - 1];

  const iconStartTrip = useMemo(
    () =>
      L.icon({
        iconUrl: toAbsoluteUrl('/media/icons/trip-start.svg'),
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      }),
    []
  );

  const iconEndTrip = useMemo(
    () =>
      L.icon({
        iconUrl: toAbsoluteUrl('/media/icons/trip-end.svg'),
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      }),
    []
  );

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [bounds, map]);

  if (!pointsList || pointsList.length === 0) {
    return null;
  }

  return (
    <>
      <Polyline color="#5271FF" weight={5} positions={route} />

      {startPoint && <Marker position={startPoint} icon={iconStartTrip} />}

      {endPoint && <Marker position={endPoint} icon={iconEndTrip} />}
    </>
  );
}
