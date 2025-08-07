import { ReplayDTO, searchReplays, SearchTripsParams } from '@/api/replay';
import { IntervalType } from '@/api/trips';
import useSetSearchParam from '@/hooks/useQueryParam';
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { ReplayContext, SelectionState, SelectionStateType } from './ReplayContextHooks';

export const ReplayProvider = ({ children }: PropsWithChildren) => {
  const {
    value: searchDeviceQuery,
    setValue: _setSearchDeviceQuery,
    setSearchParam: setSearchDeviceQuery
  } = useSetSearchParam('device');
  const { value: startDate, setSearchParam: setStartDate } = useSetSearchParam('startDate');
  const { value: endDate, setSearchParam: setEndDate } = useSetSearchParam('endDate');
  const { value: startTime, setSearchParam: setStartTime } = useSetSearchParam('startTime');
  const { value: endTime, setSearchParam: setEndTime } = useSetSearchParam('endTime');
  const [replayData, setReplayData] = useState<ReplayDTO[]>();
  const [loading, setLoading] = useState(false);
  const [selectedIntervalsMap, setSelectedIntervalsMap] = useState<Record<string, ReplayDTO>>({});
  const [selectionState, setSelectionState] = useState<SelectionState>({
    all: false,
    trips: false,
    parkings: false
  });

  const selectedIntervals = useMemo(() => {
    return Object.keys(selectedIntervalsMap || {});
  }, [selectedIntervalsMap]);

  // Calculate counts for different interval types
  const intervalCounts = useMemo(() => {
    if (!replayData) return { trips: 0, parkings: 0, total: 0 };

    const trips = replayData.filter(
      (interval) => interval.intervalType === IntervalType.Trip
    ).length;
    const parkings = replayData.filter(
      (interval) => interval.intervalType === IntervalType.Parking
    ).length;

    return {
      trips,
      parkings,
      total: replayData.length
    };
  }, [replayData]);

  // Calculate selected counts
  const selectedCounts = useMemo(() => {
    const selectedValues = Object.values(selectedIntervalsMap);
    const trips = selectedValues.filter(
      (interval) => interval.intervalType === IntervalType.Trip
    ).length;
    const parkings = selectedValues.filter(
      (interval) => interval.intervalType === IntervalType.Parking
    ).length;

    return {
      trips,
      parkings,
      total: selectedValues.length
    };
  }, [selectedIntervalsMap]);

  useEffect(() => {
    if (!replayData) return;

    const newSelectionState = {
      trips: selectedCounts.trips > 0 && selectedCounts.trips === intervalCounts.trips,
      parkings: selectedCounts.parkings > 0 && selectedCounts.parkings === intervalCounts.parkings,
      all: selectedCounts.total > 0 && selectedCounts.total === intervalCounts.total
    };

    setSelectionState(newSelectionState);
  }, [selectedCounts, intervalCounts, replayData]);

  const search = useCallback(async () => {
    setLoading(true);
    setSearchDeviceQuery(searchDeviceQuery);

    if (!searchDeviceQuery) {
      setReplayData(undefined);
      setLoading(false);
      return;
    }

    try {
      const params: SearchTripsParams = {
        ident: searchDeviceQuery,
        startDate,
        endDate,
        startTime,
        endTime
      };

      const replayDto = await searchReplays(params);

      setReplayData(replayDto);
      setSelectedIntervalsMap({});
    } catch (error) {
      console.error('Failed to search for replay data:', error);
      setReplayData(undefined);
    } finally {
      setLoading(false);
    }
  }, [endDate, endTime, searchDeviceQuery, startDate, startTime]);

  const handleIntervalSelection = useCallback((interval: ReplayDTO) => {
    setSelectedIntervalsMap((prev) => {
      if (prev[interval.id]) {
        const { [interval.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [interval.id]: interval };
    });
  }, []);

  const getIntervalsByType = useCallback(
    (type: SelectionStateType): ReplayDTO[] => {
      if (!replayData) return [];

      switch (type) {
        case IntervalType.Trip:
          return replayData.filter((interval) => interval.intervalType === IntervalType.Trip);
        case IntervalType.Parking:
          return replayData.filter((interval) => interval.intervalType === IntervalType.Parking);
        case 'all':
          return replayData;
        default:
          return [];
      }
    },
    [replayData]
  );

  const handleSelectAll = useCallback(
    (type: SelectionStateType) => {
      const intervalsToSelect = getIntervalsByType(type);

      if (intervalsToSelect.length === 0) return;

      setSelectedIntervalsMap((prev) => {
        const newMap = { ...prev };

        intervalsToSelect.forEach((interval) => {
          newMap[interval.id] = interval;
        });

        return newMap;
      });
    },
    [getIntervalsByType]
  );

  const handleDeselectAll = useCallback((type: SelectionStateType) => {
    if (type === 'all') {
      setSelectedIntervalsMap({});
      return;
    }

    setSelectedIntervalsMap((prev) => {
      const filteredMap: Record<string, ReplayDTO> = {};

      Object.values(prev).forEach((interval) => {
        if (
          (type === IntervalType.Trip && interval.intervalType !== IntervalType.Trip) ||
          (type === IntervalType.Parking && interval.intervalType !== IntervalType.Parking)
        ) {
          filteredMap[interval.id] = interval;
        }
      });

      return filteredMap;
    });
  }, []);

  useEffect(() => {
    if (searchDeviceQuery && startDate && endDate) {
      search();
    }
  }, []);

  return (
    <ReplayContext.Provider
      value={{
        searchDeviceQuery,
        setSearchDeviceQuery: _setSearchDeviceQuery,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
        search,
        replayData,
        loading,
        selectedIntervals,
        selectedIntervalsData: selectedIntervalsMap,
        handleIntervalSelection,
        handleSelectAll,
        handleDeselectAll,
        selectionState
      }}
    >
      {children}
    </ReplayContext.Provider>
  );
};
