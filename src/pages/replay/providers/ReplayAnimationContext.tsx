import { createContext, PropsWithChildren, useContext, useEffect, useState, useMemo } from 'react';
import { useReplayContext } from './ReplayContextHooks';
import { ReplayPoint, ReplayDTO } from '@/api/replay';
import { IntervalType } from '@/api/trips';

interface AnimationContextProps {
  playing: boolean;
  current: number;
  setCurrent: (current: number) => void;
  duration: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  metaData?: any;
  setMetaData: (metaData?: any) => void;
  multiplier: number;
  setMultiplier: (multiplier: number) => void;
  currentPointIndex: number;
  messagePoints: ReplayPoint[];
  currentTripIndex: number;
  setCurrentTripIndex: (index: number) => void;
  sortedTrips: ReplayDTO[];
}

const ReplayAnimationContext = createContext<AnimationContextProps>({
  playing: false,
  current: 0,
  setCurrent: () => {},
  duration: 0,
  play: () => {},
  pause: () => {},
  stop: () => {},
  next: () => {},
  prev: () => {},
  setMetaData: () => {},
  multiplier: 1,
  setMultiplier: () => {},
  currentPointIndex: 0,
  messagePoints: [],
  currentTripIndex: 0,
  setCurrentTripIndex: () => {},
  sortedTrips: []
});

const BASE_INTERVAL = 10000; // 10 seconds

export const ReplayAnimationProvider = ({ children }: PropsWithChildren) => {
  const { selectedIntervalsData } = useReplayContext();
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [max, setMax] = useState(10000);
  const [multiplier, setMultiplier] = useState(1);
  const [metaData, setMetaData] = useState<any>();
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [currentTripIndex, setCurrentTripIndex] = useState(0);

  const sortedTrips = useMemo(() => {
    if (!selectedIntervalsData) return [];

    return Object.values(selectedIntervalsData)
      .filter((interval) => interval.intervalType === IntervalType.Trip)
      .sort((a, b) => a.startTime - b.startTime);
  }, [selectedIntervalsData]);

  const messagePoints = useMemo(() => {
    if (sortedTrips.length === 0) return [];

    const currentTrip = sortedTrips[currentTripIndex];
    if (!currentTrip?.pointsList) return [];

    return [...currentTrip.pointsList].sort((a, b) => a.timestamp - b.timestamp);
  }, [sortedTrips, currentTripIndex]);

  const snapPositions = useMemo(() => {
    return messagePoints.map(
      (_, index) => (index / (messagePoints.length > 1 ? messagePoints.length - 1 : 1)) * max
    );
  }, [messagePoints, max]);

  const play = () => {
    if (sortedTrips.length === 0) return;

    if (current >= max && currentPointIndex >= messagePoints.length - 1) {
      if (currentTripIndex < sortedTrips.length - 1) {
        setCurrentTripIndex(currentTripIndex + 1);
        setCurrent(0);
        setCurrentPointIndex(0);
        setTimeout(() => {
          setPlaying(true);
        }, 200);
      } else {
        // If this is the last trip, restart from the first trip
        setCurrentTripIndex(0);
        setCurrent(0);
        setCurrentPointIndex(0);
        setTimeout(() => {
          setPlaying(true);
        }, 200);
      }
      return;
    }

    setPlaying(true);
  };

  const pause = () => {
    setPlaying(false);
  };

  const stop = () => {
    setPlaying(false);
    setCurrent(0);
    setCurrentPointIndex(0);
    setCurrentTripIndex(0);
  };

  const next = () => {
    const nextIndex = currentPointIndex + 1;
    if (nextIndex < messagePoints.length) {
      setCurrentPointIndex(nextIndex);
      const newPosition = snapPositions[nextIndex];
      setCurrent(newPosition);
    } else if (currentTripIndex < sortedTrips.length - 1) {
      setCurrentTripIndex(currentTripIndex + 1);
      setCurrent(0);
      setCurrentPointIndex(0);
    }
  };

  const prev = () => {
    const prevIndex = currentPointIndex - 1;
    if (prevIndex >= 0) {
      setCurrentPointIndex(prevIndex);
      const newPosition = snapPositions[prevIndex];
      setCurrent(newPosition);
    } else if (currentTripIndex > 0) {
      const prevTripIndex = currentTripIndex - 1;
      setCurrentTripIndex(prevTripIndex);

      const previousTripPoints = sortedTrips[prevTripIndex]?.pointsList || [];
      const sortedPoints = [...previousTripPoints].sort((a, b) => a.timestamp - b.timestamp);
      const lastPointIndex = Math.max(0, sortedPoints.length - 1);

      setCurrent(max);
      setCurrentPointIndex(lastPointIndex);
    }
  };

  useEffect(() => {
    if (playing && messagePoints.length > 0) {
      const interval = setTimeout(() => {
        const nextIndex = currentPointIndex + 1;

        if (nextIndex >= messagePoints.length) {
          if (currentTripIndex < sortedTrips.length - 1) {
            setCurrentTripIndex(currentTripIndex + 1);
            setCurrent(0);
            setCurrentPointIndex(0);
          } else {
            pause();
            setCurrent(max);
          }
          return;
        }

        setCurrentPointIndex(nextIndex);
        const newPosition = snapPositions[nextIndex];
        setCurrent(newPosition);
      }, BASE_INTERVAL / multiplier);

      return () => {
        clearTimeout(interval);
      };
    }
  }, [
    playing,
    currentPointIndex,
    messagePoints,
    multiplier,
    max,
    snapPositions,
    sortedTrips,
    currentTripIndex
  ]);

  useEffect(() => {
    if (messagePoints.length > 0 && currentPointIndex < messagePoints.length) {
      const point = messagePoints[currentPointIndex];
      setMetaData({
        speed: point.speed ?? 0,
        timestamp: point.timestamp * 1000,
        direction: point.direction
      });
    }
  }, [currentPointIndex, messagePoints]);

  useEffect(() => {
    setCurrentTripIndex(0);
    setCurrent(0);
    setCurrentPointIndex(0);
    setPlaying(false);

    if (sortedTrips.length > 0) {
      const firstTrip = sortedTrips[0];
      setMax(firstTrip.endTime * 1000 - firstTrip.startTime * 1000);
    }
  }, [sortedTrips]);

  useEffect(() => {
    if (sortedTrips.length > 0 && currentTripIndex < sortedTrips.length) {
      const currentTrip = sortedTrips[currentTripIndex];
      setMax(currentTrip.endTime * 1000 - currentTrip.startTime * 1000);
      setCurrent(0);
      setCurrentPointIndex(0);
    }
  }, [currentTripIndex, sortedTrips]);

  const changeCurrent = (newValue: number) => {
    pause();
    setCurrent(newValue);

    if (snapPositions.length > 0) {
      const closestIndex = snapPositions.reduce((prev, curr, index) => {
        return Math.abs(curr - newValue) < Math.abs(snapPositions[prev] - newValue) ? index : prev;
      }, 0);

      setCurrentPointIndex(closestIndex);
      setCurrent(snapPositions[closestIndex]);
    }
  };

  return (
    <ReplayAnimationContext.Provider
      value={{
        playing,
        current,
        setCurrent: changeCurrent,
        duration: max,
        play,
        pause,
        stop,
        next,
        prev,
        multiplier,
        setMultiplier,
        metaData,
        setMetaData,
        currentPointIndex,
        messagePoints,
        currentTripIndex,
        setCurrentTripIndex,
        sortedTrips
      }}
    >
      {children}
    </ReplayAnimationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useReplayAnimationContext = () => {
  return useContext(ReplayAnimationContext);
};
