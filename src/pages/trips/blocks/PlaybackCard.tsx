import { Slider } from '@mui/material';
import { useAnimationContext } from '../providers/AnimationContext';
import { FaPause, FaPlay } from 'react-icons/fa';
import { PiFastForward } from 'react-icons/pi';
import { useAuthContext } from '@/auth';
import SpeedGauge from '@/pages/device/SpeedGuage';
import { useTripsContext } from '../providers/TripsContext';
import { toAbsoluteUrl } from '@/utils';
import { formatInTimeZone } from 'date-fns-tz';
import { FormattedMessage } from 'react-intl';
import clsx from 'clsx';
import { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SpeedChart from '@/pages/replay/components/SpeedChart';
import { ReplayPoint } from '@/api/replay';

const MultiplierOptions = [0.5, 1, 2, 3, 5, 10, 20];
const ITEMS_PER_SLIDE = 10;

const transformTripPathToReplayPoint = (tripPaths: any[]): ReplayPoint[] => {
  return tripPaths.map((path, index) => ({
    id: `${path.tripId}-${index}`,
    latitude: path.latitude,
    longitude: path.longitude,
    timestamp: new Date(path.timestamp).getTime() / 1000,
    speed: path.speed,
    direction: path.direction
  }));
};

export const PlaybackCard = () => {
  const {
    playing,
    play,
    pause,
    current,
    setCurrent,
    next,
    prev,
    metaData,
    multiplier,
    setMultiplier,
    duration,
    currentPointIndex,
    messagePoints
  } = useAnimationContext();
  const { currentUser } = useAuthContext();
  const { selectedTrip, setSelectedTrip, originalTripGroup, setOriginalTripGroup } =
    useTripsContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTripIndex, setCurrentTripIndex] = useState(0);

  useEffect(() => {
    if (selectedTrip && 'trips' in selectedTrip) {
      if (!originalTripGroup || originalTripGroup.id !== selectedTrip.id) {
        setOriginalTripGroup?.(selectedTrip);
        setCurrentTripIndex(0);
        setCurrentSlide(0);
      }
    } else if (selectedTrip && !('trips' in selectedTrip)) {
      if (
        originalTripGroup &&
        !originalTripGroup.trips.some((trip) => trip.id === selectedTrip.id)
      ) {
        setOriginalTripGroup?.(undefined);
        setCurrentTripIndex(0);
        setCurrentSlide(0);
      }
    }
  }, [selectedTrip, originalTripGroup, setOriginalTripGroup]);

  const sortedTrips = useMemo(() => {
    if (!selectedTrip) return [];
    if ('trips' in selectedTrip) {
      return selectedTrip.trips;
    }
    return [selectedTrip];
  }, [selectedTrip]);

  const paginationTrips = useMemo(() => {
    return originalTripGroup?.trips || sortedTrips;
  }, [originalTripGroup, sortedTrips]);

  useEffect(() => {
    if (selectedTrip && !('trips' in selectedTrip) && paginationTrips.length > 0) {
      const index = paginationTrips.findIndex((trip) => trip.id === selectedTrip.id);
      if (index !== -1 && index !== currentTripIndex) {
        setCurrentTripIndex(index);
      }
    }
  }, [selectedTrip, paginationTrips, currentTripIndex]);

  const totalSlides = useMemo(() => {
    if (!paginationTrips || paginationTrips.length === 0) return 0;
    return Math.ceil(paginationTrips.length / ITEMS_PER_SLIDE);
  }, [paginationTrips]);

  useEffect(() => {
    const slideIndex = Math.floor(currentTripIndex / ITEMS_PER_SLIDE);
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTripIndex]);

  const currentSlideItems = useMemo(() => {
    if (!paginationTrips || paginationTrips.length === 0) return [];
    const startIdx = currentSlide * ITEMS_PER_SLIDE;
    return paginationTrips.slice(startIdx, startIdx + ITEMS_PER_SLIDE);
  }, [paginationTrips, currentSlide]);
  const handleTripChange = (index: number) => {
    if (index >= 0 && index < paginationTrips.length) {
      pause();
      setCurrentTripIndex(index);
      const selectedTripForPlayback = paginationTrips[index];
      setSelectedTrip(selectedTripForPlayback);
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleIncreasePlayBackSpeed = () => {
    const currentIdx = MultiplierOptions.indexOf(multiplier);
    if (currentIdx < MultiplierOptions.length - 1) {
      const nextIdx = currentIdx + 1;
      setMultiplier(MultiplierOptions[nextIdx]);
    }
  };

  const handleDecreasePlayBackSpeed = () => {
    const currentIdx = MultiplierOptions.indexOf(multiplier);
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setMultiplier(MultiplierOptions[prevIdx]);
    }
  };

  const marks = useMemo(() => {
    if (messagePoints.length <= 1) return [];

    return messagePoints.map((_, index) => ({
      value: (index / (messagePoints.length - 1)) * duration
    }));
  }, [messagePoints, duration]);

  const getMessageInfo = () => {
    if (messagePoints.length > 0 && currentPointIndex < messagePoints.length) {
      return `Message ${currentPointIndex + 1} of ${messagePoints.length}`;
    }
    return '';
  };
  const currentTrip = useMemo(() => {
    if (
      !paginationTrips ||
      paginationTrips.length === 0 ||
      currentTripIndex >= paginationTrips.length
    ) {
      return null;
    }
    return paginationTrips[currentTripIndex];
  }, [paginationTrips, currentTripIndex]);

  if (!selectedTrip) {
    return null;
  }
  const mileage = currentTrip
    ? currentTrip.mileage
    : paginationTrips.reduce((acc, trip) => acc + trip.mileage, 0);

  const maxSpeed = currentTrip
    ? currentTrip.maxSpeed
    : Math.max(...paginationTrips.map((trip) => trip.maxSpeed), 0);
  const startTimestamp = currentTrip
    ? new Date(Number(currentTrip.startDate) * 1000)
    : paginationTrips.length > 0
      ? new Date(Number(Math.min(...paginationTrips.map((t) => Number(t.startDate)))) * 1000)
      : new Date();

  const endTimestamp = currentTrip
    ? new Date(Number(currentTrip.endDate) * 1000)
    : paginationTrips.length > 0
      ? new Date(Number(Math.max(...paginationTrips.map((t) => Number(t.endDate)))) * 1000)
      : new Date();
  // we want this component to be ltr as all controls are designed like so.
  // it being localized is not a huge deal
  return (
    <div className="card w-[59vw] flex flex-col" dir="ltr">
      <div className="p-1 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-12 w-full px-10">
          <div className="flex flex-col justify-between items-center">
            <div className="flex flex-col gap-2 items-center">
              <div className="flex gap-12 items-center justify-center p-4">
                <div className="flex gap-6 items-center">
                  <button
                    className="btn btn-icon rounded-lg btn-info -scale-x-100 size-10"
                    onClick={prev}
                    disabled={current === 0 && currentTripIndex === 0}
                  >
                    <PiFastForward size={22} />
                  </button>

                  <button
                    className="btn btn-icon text-info bg-transparent size-10"
                    onClick={() => {
                      if (playing) {
                        pause();
                      } else {
                        play();
                      }
                    }}
                  >
                    {playing ? <FaPause size={28} /> : <FaPlay size={28} />}
                  </button>

                  <button
                    className="btn btn-icon rounded-lg btn-info size-10"
                    onClick={next}
                    disabled={current === duration && currentTripIndex === sortedTrips.length - 1}
                  >
                    <PiFastForward size={22} />
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    className="text-lg p-0 font-semibold text-gray-700 disabled:text-gray-400 hover:text-gray-900"
                    onClick={handleDecreasePlayBackSpeed}
                    disabled={MultiplierOptions.indexOf(multiplier) === 0}
                  >
                    -
                  </button>
                  <button className="btn btn-warning text-xs rounded-full p-4 size-9 flex justify-center items-center">
                    x{multiplier}
                  </button>
                  <button
                    className="text-lg p-0 font-semibold text-gray-700 disabled:text-gray-400 hover:text-gray-900"
                    onClick={handleIncreasePlayBackSpeed}
                    disabled={
                      MultiplierOptions.indexOf(multiplier) === MultiplierOptions.length - 1
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              {((originalTripGroup?.trips && originalTripGroup.trips.length > 1) ||
                paginationTrips.length > 1) && (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="btn btn-sm btn-icon btn-light-primary rounded-md font-semibold"
                      disabled={currentSlide === 0}
                      onClick={handlePrevSlide}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex gap-1">
                      {currentSlideItems.map((_, idx) => {
                        const actualIndex = currentSlide * ITEMS_PER_SLIDE + idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleTripChange(actualIndex)}
                            className={`size-8 rounded-md flex items-center justify-center text-xs font-semibold ${
                              actualIndex === currentTripIndex
                                ? 'bg-info text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {actualIndex + 1}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      className="btn btn-sm btn-icon btn-light-info rounded-md font-semibold"
                      disabled={currentSlide === totalSlides - 1}
                      onClick={handleNextSlide}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="flex justify-center gap-1 mt-1">
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 rounded-full transition-all ${
                          idx === currentSlide ? 'w-4 bg-info' : 'w-2 bg-gray-300'
                        }`}
                        onClick={() => setCurrentSlide(idx)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-14 items-center justify-center">
              <div className="w-40">
                <SpeedGauge value={metaData?.speed?.toFixed()} maxValue={160} unit="km" />
              </div>
              <div className="flex flex-col items-center gap-1">
                {metaData?.timestamp && (
                  <div className="flex justify-between bg-gray-200 text-gray-600 font-semibold text-sm text-center py-1 px-2 rounded-md">
                    <div className="text-nowrap">
                      {new Date(metaData.timestamp).toLocaleString('en-UK', {
                        timeZone: currentUser?.timezone
                      })}
                    </div>
                  </div>
                )}
                <div className="text-sm font-semibold text-gray-700">{getMessageInfo()}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start justify-center gap-7">
            <div className="flex flex-col gap-1">
              <div className="flex gap-1 items-center">
                <img src={toAbsoluteUrl('/media/icons/meter.svg')} />
                <span className="text-xs font-medium text-[#5E6278] dark:text-gray-700">
                  <FormattedMessage id="TRIPS.FIELD.MILEAGE" />
                </span>
              </div>
              <div className="font-semibold text-sm text-[#2D3748] dark:text-gray-900">
                {mileage.toFixed(2)} KM
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1 items-center">
                <img src={toAbsoluteUrl('/media/icons/speed-blue.svg')} />
                <span className="text-xs font-medium text-[#5E6278] dark:text-gray-700">
                  <FormattedMessage id="TRIPS.FIELD.MAX_SPEED" />
                </span>
              </div>
              <div className="font-semibold text-sm text-[#2D3748] dark:text-gray-900">
                {maxSpeed.toFixed(0)} Km/h
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="font-semibold text-xs text-[#2D3748] dark:text-gray-900 text-center">
            {formatInTimeZone(startTimestamp, currentUser!.timezone, 'yyyy/MM/dd HH:mm:ss')}
          </div>
          <Slider
            value={current}
            onChange={(_, v) => {
              if (typeof v === 'number') {
                pause();
                setCurrent(v);
              }
            }}
            min={0}
            max={duration}
            marks={marks}
            step={null}
            size="medium"
            className={clsx(
              '[&>.MuiSlider-rail]:bg-neutral-200 [&>.MuiSlider-rail]:opacity-100 [&>.MuiSlider-rail]:h-3',
              '[&>.MuiSlider-track]:bg-gray-700 [&>.MuiSlider-track]:h-3 [&>.MuiSlider-track]:border-gray-600',
              '[&>.MuiSlider-thumb]:bg-gray-800 [&>.MuiSlider-thumb]:size-7',
              '[&>.MuiSlider-mark]:hidden'
            )}
          />
          <div className="font-semibold text-xs text-[#2D3748] dark:text-gray-900 text-center">
            {formatInTimeZone(endTimestamp, currentUser!.timezone, 'yyyy/MM/dd HH:mm:ss')}
          </div>
        </div>
      </div>

      <SpeedChart
        points={transformTripPathToReplayPoint(messagePoints)}
        currentPointIndex={currentPointIndex}
      />
    </div>
  );
};
