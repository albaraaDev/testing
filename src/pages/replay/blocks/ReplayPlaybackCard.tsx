import { Slider } from '@mui/material';
import { FaPause, FaPlay } from 'react-icons/fa';
import { PiFastForward } from 'react-icons/pi';
import { useAuthContext } from '@/auth';
import SpeedGauge from '@/pages/device/SpeedGuage';
import { toAbsoluteUrl } from '@/utils';
import { formatInTimeZone } from 'date-fns-tz';
import { FormattedMessage } from 'react-intl';
import { useReplayContext } from '../providers/ReplayContextHooks';
import { useReplayAnimationContext } from '../providers/ReplayAnimationContext';
import { useMemo } from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SpeedChart from '../components/SpeedChart';

const MultiplierOptions = [0.5, 1, 2, 3, 5, 10, 20];
const MAX_VISIBLE_PAGES = 5; // Maximum number of page buttons to show

export const ReplayPlaybackCard = () => {
  const {
    playing,
    play,
    pause,
    next,
    prev,
    current,
    setCurrent,
    metaData,
    multiplier,
    setMultiplier,
    duration,
    currentPointIndex,
    messagePoints,
    currentTripIndex,
    sortedTrips,
    setCurrentTripIndex
  } = useReplayAnimationContext();
  const { currentUser } = useAuthContext();
  const { selectedIntervalsData } = useReplayContext();

  const totalTrips = useMemo(() => {
    return sortedTrips?.length || 0;
  }, [sortedTrips]);

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
    if (!sortedTrips || sortedTrips.length === 0 || currentTripIndex >= sortedTrips.length) {
      return null;
    }
    return sortedTrips[currentTripIndex];
  }, [sortedTrips, currentTripIndex]);

  const handleTripChange = (index: number) => {
    if (index >= 0 && index < sortedTrips.length) {
      pause();
      setCurrentTripIndex(index);
    }
  };

  const handleNextTrip = () => {
    if (currentTripIndex < totalTrips - 1) {
      handleTripChange(currentTripIndex + 1);
    }
  };

  const handlePrevTrip = () => {
    if (currentTripIndex > 0) {
      handleTripChange(currentTripIndex - 1);
    }
  };

  if (!selectedIntervalsData || Object.keys(selectedIntervalsData).length === 0) {
    return null;
  }

  const selectedTripCount = Object.values(selectedIntervalsData).filter(
    (interval) => interval.intervalType === 'TRIP'
  ).length;

  if (selectedTripCount === 0) {
    return null;
  }

  const mileage = currentTrip
    ? currentTrip.totalDistance
    : sortedTrips.reduce((acc, trip) => acc + trip.totalDistance, 0);

  const maxSpeed = currentTrip
    ? currentTrip.maxSpeed
    : Math.max(...sortedTrips.map((trip) => trip.maxSpeed), 0);

  const startTimestamp = currentTrip
    ? new Date(currentTrip.startTime * 1000)
    : sortedTrips.length > 0
      ? new Date(Math.min(...sortedTrips.map((t) => t.startTime)) * 1000)
      : new Date();

  const endTimestamp = currentTrip
    ? new Date(currentTrip.endTime * 1000)
    : sortedTrips.length > 0
      ? new Date(Math.max(...sortedTrips.map((t) => t.endTime)) * 1000)
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

              {sortedTrips.length > 1 && (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="btn btn-sm btn-icon btn-light-primary rounded-md font-semibold"
                      disabled={currentTripIndex === 0}
                      onClick={handlePrevTrip}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex gap-1">
                      {(() => {
                        const pages = [];
                        let startPage = Math.max(
                          0,
                          currentTripIndex - Math.floor(MAX_VISIBLE_PAGES / 2)
                        );
                        let endPage = Math.min(totalTrips - 1, startPage + MAX_VISIBLE_PAGES - 1);

                        if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
                          startPage = Math.max(0, endPage - MAX_VISIBLE_PAGES + 1);
                        }

                        if (startPage > 0) {
                          pages.push(
                            <button
                              key="first"
                              onClick={() => handleTripChange(0)}
                              className="size-8 rounded-md flex items-center justify-center text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                              1
                            </button>
                          );
                          if (startPage > 1) {
                            pages.push(
                              <span
                                key="first-ellipsis"
                                className="size-8 flex items-center justify-center text-xs text-gray-500"
                              >
                                •••
                              </span>
                            );
                          }
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handleTripChange(i)}
                              className={`size-8 rounded-md flex items-center justify-center text-xs font-semibold ${
                                i === currentTripIndex
                                  ? 'bg-info text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {i + 1}
                            </button>
                          );
                        }

                        if (endPage < totalTrips - 1) {
                          if (endPage < totalTrips - 2) {
                            pages.push(
                              <span
                                key="last-ellipsis"
                                className="size-8 flex items-center justify-center text-xs text-gray-500"
                              >
                                •••
                              </span>
                            );
                          }
                          pages.push(
                            <button
                              key="last"
                              onClick={() => handleTripChange(totalTrips - 1)}
                              className="size-8 rounded-md flex items-center justify-center text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                              {totalTrips}
                            </button>
                          );
                        }

                        return pages;
                      })()}
                    </div>

                    <button
                      className="btn btn-sm btn-icon btn-light-info rounded-md font-semibold"
                      disabled={currentTripIndex === totalTrips - 1}
                      onClick={handleNextTrip}
                    >
                      <ChevronRight size={16} />
                    </button>
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

      <SpeedChart points={messagePoints} currentPointIndex={currentPointIndex} />
    </div>
  );
};
