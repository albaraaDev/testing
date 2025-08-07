import { MonitoringVehicleDTO } from '@/api/devices';
import {
  IntervalType,
  searchTrips,
  Trip,
  TripGroup,
  TripPath,
  getFirstTripDate
} from '@/api/trips';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDateRangeArray } from '@/utils/GetDateRangeArray';
import { useGetMonitoringVehicles } from '@/api/hooks/deviceHooks';

interface TripsContextProps {
  selectedVehicle: MonitoringVehicleDTO | null;
  setSelectedVehicle: (vehicle: MonitoringVehicleDTO | null) => void;
  searchDeviceQuery: string;
  setSearchDeviceQuery: (query: string) => void;
  startDate?: string;
  setStartDate: (date: string | undefined) => void;
  endDate?: string;
  setEndDate: (date: string | undefined) => void;
  search: () => void;
  trips: TripGroup[];
  selectedTrip?: TripGroup | Trip;
  setSelectedTrip: (trip?: TripGroup | Trip) => void;
  originalTripGroup?: TripGroup;
  setOriginalTripGroup?: (tripGroup?: TripGroup) => void;
  path?: TripPath[];
  intervalType: IntervalType;
  setIntervalType: (intervalType: IntervalType) => void;
  loading: boolean;
  dateList: Date[];
  perDateTrips: Record<string, TripGroup | null>;
  perDateLoading: Record<string, boolean>;
  fetchTripsForDate: (date: Date) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const TripsContext = createContext<TripsContextProps>({
  selectedVehicle: null,
  setSelectedVehicle: () => {},
  searchDeviceQuery: '',
  setSearchDeviceQuery: () => {},
  startDate: undefined,
  setStartDate: () => {},
  endDate: undefined,
  setEndDate: () => {},
  search: () => {},
  trips: [],
  setSelectedTrip: () => {},
  originalTripGroup: undefined,
  setOriginalTripGroup: () => {},
  intervalType: IntervalType.Trip,
  setIntervalType: () => {},
  loading: false,
  dateList: [],
  perDateTrips: {},
  perDateLoading: {},
  fetchTripsForDate: () => Promise.resolve()
});

export const TripsProvider = ({ children }: PropsWithChildren) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTrip, setSelectedTrip] = useState<TripGroup | Trip>();
  const [selectedVehicle, setSelectedVehicle] = useState<MonitoringVehicleDTO | null>(null);
  const [originalTripGroup, setOriginalTripGroup] = useState<TripGroup>();
  const [path, setPath] = useState<TripPath[]>();

  const [searchDeviceQuery, setSearchDeviceQuery] = useState(searchParams.get('device') ?? '');
  const [localStartDate, setLocalStartDate] = useState(searchParams.get('startDate') || undefined);
  const [localEndDate, setLocalEndDate] = useState(searchParams.get('endDate') || undefined);

  const [localIntervalType, setLocalIntervalType] = useState<IntervalType>(() => {
    const paramIntervalType = searchParams.get('intervalType');
    if (paramIntervalType === IntervalType.Parking) {
      return IntervalType.Parking;
    }
    return IntervalType.Trip;
  });

  const formValuesRef = useRef({
    device: searchDeviceQuery,
    startDate: localStartDate,
    endDate: localEndDate,
    intervalType: localIntervalType
  });

  useEffect(() => {
    formValuesRef.current = {
      device: searchDeviceQuery,
      startDate: localStartDate,
      endDate: localEndDate,
      intervalType: localIntervalType
    };
  }, [searchDeviceQuery, localStartDate, localEndDate, localIntervalType]);

  const [trips, setTrips] = useState<TripGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateList, setDateList] = useState<Date[]>([]);
  const [perDateTrips, setPerDateTrips] = useState<Record<string, TripGroup | null>>({});
  const [perDateLoading, setPerDateLoading] = useState<Record<string, boolean>>({});

  const search = useCallback(async () => {
    setLoading(true);
    setDateList([]);
    setPerDateTrips({});
    setPerDateLoading({});

    try {
      const { device, startDate, endDate, intervalType } = formValuesRef.current;
      setSearchParams(
        (params) => {
          if (!device) {
            params.delete('device');
          } else {
            params.set('device', device);
          }

          if (!startDate) {
            params.delete('startDate');
          } else {
            params.set('startDate', startDate);
          }

          if (!endDate) {
            params.delete('endDate');
          } else {
            params.set('endDate', endDate);
          }

          // Set intervalType in URL params
          params.set('intervalType', intervalType);

          return params;
        },
        { replace: true }
      );

      // Require selectedVehicle for getFirstTripDate
      if (!selectedVehicle?.vehicleId) {
        setTrips([]);
        setDateList([]);
        return;
      }

      // Get first trip date if no startDate
      let firstTripDate: Date | null = null;
      if (startDate) {
        firstTripDate = new Date(startDate);
      } else {
        firstTripDate = await getFirstTripDate(selectedVehicle.vehicleId);
      }
      let lastDate: Date = endDate ? new Date(endDate) : new Date();
      if (firstTripDate) {
        setDateList(getDateRangeArray(firstTripDate, lastDate));
      } else {
        setDateList([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setDateList([]);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [setSearchParams, selectedVehicle]);

  const fetchTripsForDate = useCallback(
    async (date: Date) => {
      const key = date.toISOString().slice(0, 10);
      if (perDateTrips[key] !== undefined) return;
      setPerDateLoading((prev) => ({ ...prev, [key]: true }));
      try {
        const { device, intervalType } = formValuesRef.current;
        const trips = await searchTrips({
          query: device,
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
    },
    [perDateTrips]
  );

  const computePath = useCallback(
    (selectedTrip: TripGroup | Trip | undefined, intervalType: IntervalType) => {
      if (!selectedTrip) {
        return undefined;
      }

      if (intervalType === IntervalType.Parking) {
        if ('trips' in selectedTrip) {
          const firstParking = selectedTrip.trips[0];
          return [
            {
              tripId: firstParking.id,
              latitude: firstParking.startLatitude ?? 0,
              longitude: firstParking.startLongitude ?? 0,
              timestamp: firstParking.startDate,
              direction: 0,
              speed: 0
            }
          ];
        } else {
          return [
            {
              tripId: selectedTrip.id,
              latitude: selectedTrip.startLatitude ?? 0,
              longitude: selectedTrip.startLongitude ?? 0,
              timestamp: selectedTrip.startDate,
              direction: 0,
              speed: 0
            }
          ];
        }
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

      return Object.values(pathesMap).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    },
    []
  );

  // Update path when selected trip changes
  useEffect(() => {
    setPath(computePath(selectedTrip, localIntervalType));
  }, [selectedTrip, localIntervalType, computePath]);

  // Reset selection when interval type changes
  const handleIntervalTypeChange = useCallback((newIntervalType: IntervalType) => {
    setLocalIntervalType(newIntervalType);
    setSelectedTrip(undefined);
    setTrips([]);
  }, []);

  const { data: devices } = useGetMonitoringVehicles();

  // Initialize from URL params on mount
  useEffect(() => {
    const initializeFromUrl = async () => {
      const deviceFromUrl = searchParams.get('device');
      const startDateFromUrl = searchParams.get('startDate');
      const endDateFromUrl = searchParams.get('endDate');

      if (deviceFromUrl && !selectedVehicle) {
        try {
          const matchingDevice = devices?.find((device) => device.ident === deviceFromUrl);

          if (matchingDevice) {
            setSelectedVehicle(matchingDevice);
            setSearchDeviceQuery(deviceFromUrl);

            if (startDateFromUrl) setLocalStartDate(startDateFromUrl);
            if (endDateFromUrl) setLocalEndDate(endDateFromUrl);

            setTimeout(() => search(), 100);
          }
        } catch (error) {
          console.error('Error initializing from URL params:', error);
        }
      }
    };

    initializeFromUrl();
  }, [devices]);

  return (
    <TripsContext.Provider
      value={{
        selectedVehicle,
        setSelectedVehicle,
        searchDeviceQuery,
        setSearchDeviceQuery,
        startDate: localStartDate,
        setStartDate: setLocalStartDate,
        endDate: localEndDate,
        setEndDate: setLocalEndDate,
        search,
        trips,
        selectedTrip,
        setSelectedTrip,
        originalTripGroup,
        setOriginalTripGroup,
        path,
        intervalType: localIntervalType,
        setIntervalType: handleIntervalTypeChange,
        loading,
        dateList,
        perDateTrips,
        perDateLoading,
        fetchTripsForDate
      }}
    >
      {children}
    </TripsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTripsContext = () => {
  return useContext(TripsContext);
};
