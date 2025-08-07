import { createContext, PropsWithChildren, useContext, useEffect, useState, useMemo } from 'react';
import { useTripsContext } from './TripsContext';
import { TripPath } from '@/api/trips';

interface AnimationContextProps {
  playing: boolean;
  current: number;
  // eslint-disable-next-line no-unused-vars
  setCurrent: (current: number) => void;
  duration: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  metaData?: any;
  // eslint-disable-next-line no-unused-vars
  setMetaData: (metaData?: any) => void;
  multiplier: number;
  // eslint-disable-next-line no-unused-vars
  setMultiplier: (multiplier: number) => void;
  currentPointIndex: number;
  messagePoints: TripPath[];
}

const AnimationContext = createContext<AnimationContextProps>({
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
  messagePoints: []
});

const BASE_INTERVAL = 10000; // 10 seconds

export const AnimationProvider = ({ children }: PropsWithChildren) => {
  const { path } = useTripsContext();
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [max, setMax] = useState(10000);
  const [multiplier, setMultiplier] = useState(1);
  const [metaData, setMetaData] = useState<any>();
  const [currentPointIndex, setCurrentPointIndex] = useState(0);

  const messagePoints = useMemo(() => {
    return path ? [...path].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) : [];
  }, [path]);

  const snapPositions = useMemo(() => {
    if (!messagePoints.length) return [];

    return messagePoints.map(
      (_, index) => (index / (messagePoints.length > 1 ? messagePoints.length - 1 : 1)) * max
    );
  }, [messagePoints, max]);

  const play = () => {
    if (current >= max && messagePoints.length > 0) {
      setCurrent(0);
      setCurrentPointIndex(0);
      // Wait for 200 ms then play
      setTimeout(() => {
        setPlaying(true);
      }, 200);
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
  };

  const next = () => {
    const nextIndex = currentPointIndex + 1;
    if (nextIndex < messagePoints.length) {
      setCurrentPointIndex(nextIndex);
      const newPosition = snapPositions[nextIndex];
      setCurrent(newPosition);
    }
  };

  const prev = () => {
    const prevIndex = currentPointIndex - 1;
    if (prevIndex >= 0) {
      setCurrentPointIndex(prevIndex);
      const newPosition = snapPositions[prevIndex];
      setCurrent(newPosition);
    }
  };

  useEffect(() => {
    if (playing && messagePoints.length > 0) {
      const interval = setTimeout(() => {
        const nextIndex = currentPointIndex + 1;

        if (nextIndex >= messagePoints.length) {
          pause();
          setCurrent(max);
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
  }, [playing, currentPointIndex, messagePoints, multiplier, max, snapPositions]);

  useEffect(() => {
    if (messagePoints.length > 0 && currentPointIndex < messagePoints.length) {
      const point = messagePoints[currentPointIndex];
      setMetaData({
        speed: point.speed ?? 0,
        timestamp: point.timestamp.getTime()
      });
    }
  }, [currentPointIndex, messagePoints]);

  useEffect(() => {
    if (path && path.length > 0) {
      const last = path[path.length - 1];
      setMax(last.timestamp.getTime() - path[0].timestamp.getTime());
      setCurrent(0);
      setCurrentPointIndex(0);
    }
  }, [path]);

  const changeCurrent = (newValue: number) => {
    pause();
    setCurrent(newValue);

    // Find the closest snap position
    if (snapPositions.length > 0) {
      const closestIndex = snapPositions.reduce((prev, curr, index) => {
        return Math.abs(curr - newValue) < Math.abs(snapPositions[prev] - newValue) ? index : prev;
      }, 0);

      setCurrentPointIndex(closestIndex);
      setCurrent(snapPositions[closestIndex]);
    }
  };

  return (
    <AnimationContext.Provider
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
        messagePoints
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAnimationContext = () => {
  return useContext(AnimationContext);
};
