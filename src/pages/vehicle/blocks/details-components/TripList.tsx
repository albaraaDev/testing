import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  IntervalType,
  searchTrips,
  Trip,
  TripGroup,
  TripPath,
  getFirstTripDate
} from '@/api/trips';
import TripCard from '@/pages/trips/blocks/TripCard';
import { TripsContext } from '@/pages/trips/providers/TripsContext';
import L from 'leaflet';
import { toAbsoluteUrl } from '@/utils';
import AppMap from '@/components/AppMap';
import { Marker, Polyline } from 'react-leaflet';
import { getColor } from '@/pages/trips/blocks/PolylineColors';
import { useIntl } from 'react-intl';
import { ButtonRadioGroup } from '@/pages/dashboards/blocks/ButtonRadioGroup';
import { CircularProgress } from '@mui/material';
import { getDateRangeArray } from '@/utils/GetDateRangeArray';

interface TripListProps {
  vehicleId?: string;
  ident?: string;
}

const TripList: React.FC<TripListProps> = ({ vehicleId, ident }) => {
  const [selectedTrip, setSelectedTrip] = useState<TripGroup | Trip>();
  const [path, setPath] = useState<TripPath[]>();
  const map = useRef<L.Map>(null);
  const intl = useIntl();
  const [intervalType, setIntervalType] = useState<IntervalType>(IntervalType.Trip);
  const [loading, setLoading] = useState(false);
  const [dateList, setDateList] = useState<Date[]>([]);
  const [perDateTrips, setPerDateTrips] = useState<Record<string, TripGroup | null>>({});
  const [perDateLoading, setPerDateLoading] = useState<Record<string, boolean>>({});

  const providerValues = {
    selectedVehicle: null,
    setSelectedVehicle: () => {},
    searchDeviceQuery: ident || '',
    setSearchDeviceQuery: () => {},
    startDate: undefined,
    setStartDate: () => {},
    endDate: undefined,
    setEndDate: () => {},
    startTime: undefined,
    setStartTime: () => {},
    endTime: undefined,
    setEndTime: () => {},
    search: () => {},
    trips: [],
    selectedTrip,
    setSelectedTrip,
    intervalType,
    setIntervalType,
    loading,
    dateList,
    perDateTrips,
    perDateLoading,
    fetchTripsForDate: async (date: Date) => {
      const key = date.toISOString().slice(0, 10);
      if (perDateTrips[key] !== undefined) return;
      setPerDateLoading((prev) => ({ ...prev, [key]: true }));
      try {
        const trips = await searchTrips({
          query: ident || '',
          startDate: key,
          endDate: key,
          intervalType
        });
        setPerDateTrips((prev) => ({ ...prev, [key]: trips[0] || { id: key, date, trips: [] } }));
      } catch {
        setPerDateTrips((prev) => ({ ...prev, [key]: { id: key, date, trips: [] } }));
      } finally {
        setPerDateLoading((prev) => ({ ...prev, [key]: false }));
      }
    }
  };

  const loadInitialData = async () => {
    if (!vehicleId) return;
    try {
      // Get first trip date
      const firstTripDate = await getFirstTripDate(vehicleId);
      if (firstTripDate) {
        const lastDate = new Date();
        setDateList(getDateRangeArray(firstTripDate, lastDate));
      } else {
        setDateList([]);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setDateList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ident || !vehicleId) return;
    setLoading(true);
    loadInitialData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId, ident]);

  useEffect(() => {
    if (!selectedTrip) {
      setPath(undefined);
      return;
    }

    if (intervalType === IntervalType.Parking) {
      if ('trips' in selectedTrip) {
        const firstParking = selectedTrip.trips[0];
        setPath([
          {
            tripId: firstParking.id,
            latitude: firstParking.startLatitude ?? 0,
            longitude: firstParking.startLongitude ?? 0,
            timestamp: firstParking.startDate,
            direction: 0,
            speed: 0
          }
        ]);
      } else {
        setPath([
          {
            tripId: selectedTrip.id,
            latitude: selectedTrip.startLatitude ?? 0,
            longitude: selectedTrip.startLongitude ?? 0,
            timestamp: selectedTrip.startDate,
            direction: 0,
            speed: 0
          }
        ]);
      }
      return;
    }

    const pathesMap: Record<number, TripPath> = {};

    if ('trips' in selectedTrip) {
      const pathes = selectedTrip.trips.map((trip) => trip.path).flat();
      pathes.forEach((path) => {
        pathesMap[path.timestamp.getTime()] = path;
      });
    } else {
      selectedTrip.path.forEach((path) => {
        pathesMap[path.timestamp.getTime()] = path;
      });
    }

    setPath(Object.values(pathesMap).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
  }, [selectedTrip, intervalType]);

  const tripsToRender = useMemo(() => {
    if (!selectedTrip) {
      return [];
    }
    if ('trips' in selectedTrip) {
      return selectedTrip.trips;
    }
    return [selectedTrip];
  }, [selectedTrip]);

  const bounds = useMemo(() => {
    if (!path || path.length === 0) {
      return undefined;
    }
    const latLng = L.latLng([path[0].latitude, path[0].longitude]);
    return path.reduce(
      (acc, point) => acc.extend([point.latitude, point.longitude]),
      L.latLngBounds(latLng, latLng)
    );
  }, [path]);

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
    if (!bounds) {
      return;
    }
    map.current?.flyToBounds(bounds);
  }, [bounds, map]);

  return (
    <TripsContext.Provider value={{ ...providerValues }}>
      <div className="flex flex-col mb-4 md:flex-row space-y-4 md:space-x-4 h-full w-600 mt-0">
        <div className="p-4 card hover:shadow-md lg:w-1/2 mt-4 h-[450px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {intl.formatMessage({ id: 'TRIPS.LIST.TITLE' })}
            </h2>
          </div>
          <ButtonRadioGroup<IntervalType>
            selection={intervalType}
            setSelection={setIntervalType}
            selections={[IntervalType.Trip, IntervalType.Parking]}
            translations={{
              [IntervalType.Trip]: intl.formatMessage({ id: 'TRIPS.FIELD.TRIP' }),
              [IntervalType.Parking]: intl.formatMessage({ id: 'TRIPS.FIELD.PARKING' })
            }}
            className="w-full btn data-[selected=true]:btn-dark btn-light data-[selected=false]:btn-clear items-center justify-center mb-4"
          />
          {loading ? (
            <div className="text-center text-gray-500 h-full flex items-center justify-center py-2">
              <CircularProgress size={24} color="inherit" />
            </div>
          ) : dateList.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              {intl.formatMessage({ id: 'TRIPS.LIST.NO_TRIPS' })}
            </div>
          ) : (
            <div className="scrollable-y-auto pb-2 flex flex-col gap-[10px]">
              {dateList.map((date) => {
                const key = date.toISOString().slice(0, 10);
                return (
                  <TripCard
                    key={key}
                    date={date}
                    tripGroup={perDateTrips[key]}
                    loading={!!perDateLoading[key]}
                    fetchTripsForDate={providerValues.fetchTripsForDate}
                    intervalType={intervalType}
                  />
                );
              })}
            </div>
          )}
        </div>
        <div className="card hover:shadow-md w-full">
          <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
            <AppMap dragging={false} ref={map}>
              {intervalType === IntervalType.Parking && path && path.length > 0 ? (
                <Marker
                  position={[path[0].latitude, path[0].longitude]}
                  icon={icon}
                  title={`Parking from ${path[0].timestamp.toLocaleString()}`}
                />
              ) : (
                <>
                  {tripsToRender.map((trip) => (
                    <Polyline
                      key={trip.id}
                      pathOptions={{ color: getColor(trip.id) }}
                      positions={trip.path.map((point) => [point.latitude, point.longitude])}
                    />
                  ))}
                  {path && path.length > 1 && (
                    <>
                      <Marker
                        position={[path[0].latitude, path[0].longitude]}
                        icon={iconStartTrip}
                      />
                      <Marker
                        position={[path[path.length - 1].latitude, path[path.length - 1].longitude]}
                        icon={iconEndTrip}
                      />
                    </>
                  )}
                </>
              )}
            </AppMap>
          </div>
        </div>
      </div>
    </TripsContext.Provider>
  );
};

export default TripList;
