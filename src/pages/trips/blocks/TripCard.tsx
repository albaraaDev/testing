import React, { useMemo, useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { toAbsoluteUrl } from '@/utils';
import { IntervalType, TripGroup } from '@/api/trips';
import { Collapse, CircularProgress } from '@mui/material';
import { KeenIcon } from '@/components';
import { useTripsContext } from '../providers/TripsContext';
import { useAnimationContext } from '../providers/AnimationContext';
import { useAuthContext } from '@/auth';
import { FormattedMessage } from 'react-intl';
import { useLanguage } from '@/i18n';
import clsx from 'clsx';
import { FaPlay, FaPause } from 'react-icons/fa';

function formatTotalDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours} h , ${minutes} min , ${secs} sec`;
}

interface TripCardProps {
  date: Date;
  tripGroup: TripGroup | null | undefined;
  loading: boolean;
  fetchTripsForDate: (date: Date) => Promise<void>;
  intervalType: IntervalType;
  animation?: boolean;
}

const TripCard: React.FC<TripCardProps> = ({
  date,
  tripGroup,
  loading,
  fetchTripsForDate,
  intervalType,
  animation = true
}) => {
  const { isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const { setSelectedTrip, selectedTrip } = useTripsContext();
  const { stop, play, playing, pause } = useAnimationContext();
  const { currentUser } = useAuthContext();

  const handleExpand = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && !tripGroup && !loading && !hasRequested) {
      setHasRequested(true);
      await fetchTripsForDate(date);
      setIsOpen(true);
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  const summary = useMemo(() => {
    if (!tripGroup || !tripGroup.trips.length) return null;
    return {
      totalDuration: tripGroup.trips.reduce((acc, trip) => acc + trip.totalDuration, 0),
      mileage: tripGroup.trips.reduce((acc, trip) => acc + trip.mileage, 0),
      maxSpeed: tripGroup.trips.reduce((acc, trip) => Math.max(acc, trip.maxSpeed), 0)
    };
  }, [tripGroup]);

  React.useEffect(() => {
    if (isOpen) {
      setHasRequested(false);
      fetchTripsForDate(date);
      setHasRequested(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalType]);

  return (
    <div
      className="flex flex-col mb-1.5 rounded-[10px] border-2 border-[#E7E8ED] dark:border-gray-200 overflow-hidden data-[selected=true]:border-[#5271FF] data-[selected=true]:shadow-md shrink-0 transition-all duration-200"
      data-selected={tripGroup && selectedTrip === tripGroup}
    >
      <div
        onClick={handleExpand}
        className="flex flex-col gap-2 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
        style={{ direction: isRTL() ? 'rtl' : 'ltr' }}
      >
        <div className="flex px-[6px] items-center justify-between py-2">
          <div className="text-sm font-semibold text-[#3F4254] dark:text-gray-50">
            {formatInTimeZone(date, currentUser?.timezone || 'UTC', 'EEEE dd/MM/yyyy')}
          </div>
          <div
            className="flex items-center justify-center cursor-pointer p-1"
            onClick={handleExpand}
          >
            {loading ? (
              <CircularProgress size={12} color="inherit" />
            ) : (
              <KeenIcon icon={isOpen ? 'up' : 'down'} className="dark:text-[#F5F5FC]" />
            )}
          </div>
        </div>
      </div>
      <div>
        <Collapse in={isOpen}>
          {loading ? (
            <div className="flex justify-center items-center p-3">
              <CircularProgress size={24} />
            </div>
          ) : !tripGroup || !tripGroup.trips.length ? (
            <div className="flex justify-center items-center p-3 text-gray-500">
              <FormattedMessage id="COMMON.NO_DATA" defaultMessage="No data to display" />
            </div>
          ) : (
            <>
              <div
                className="flex justify-between items-center p-3 border-t-2 border-dashed cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  stop();
                  setSelectedTrip(selectedTrip === tripGroup ? undefined : tripGroup);
                }}
                data-selected={selectedTrip === tripGroup}
              >
                <div
                  className={clsx('grid gap-2 relative flex-grow', {
                    'grid-cols-3': intervalType === IntervalType.Trip,
                    'grid-cols-2': intervalType === IntervalType.Parking
                  })}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1 items-center">
                      <img src={toAbsoluteUrl('/media/icons/flag.svg')} />
                      <span className="text-[10px] font-medium text-[#5E6278] dark:text-gray-700">
                        <FormattedMessage id="TRIPS.FIELD.START_DATE" />
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-[#2D3748] dark:text-gray-900">
                      {formatInTimeZone(date, currentUser?.timezone || 'UTC', 'yyyy/MM/dd')}
                    </div>
                  </div>
                  {intervalType === IntervalType.Parking && summary && (
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1 items-center">
                        <img src={toAbsoluteUrl(`/media/icons/clock.svg`)} />
                        <span className="text-[10px] font-medium text-[#5E6278] dark:text-gray-700">
                          <FormattedMessage id="TRIPS.FIELD.TOTAL_DURATION" />
                        </span>
                      </div>
                      <div className="font-semibold text-sm text-[#2D3748] dark:text-gray-900">
                        {formatTotalDuration(summary.totalDuration)}
                      </div>
                    </div>
                  )}
                  {intervalType === IntervalType.Trip && summary && (
                    <>
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1 items-center">
                          <img src={toAbsoluteUrl('/media/icons/meter.svg')} />
                          <span className="text-[10px] font-medium text-[#5E6278] dark:text-gray-700">
                            <FormattedMessage id="TRIPS.FIELD.MILEAGE" />
                          </span>
                        </div>
                        <div className="font-semibold text-sm text-[#2D3748] dark:text-gray-900">
                          {summary.mileage.toFixed(2)} KM
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1 items-center">
                          <img src={toAbsoluteUrl('/media/icons/speed-blue.svg')} />
                          <span className="text-[10px] font-medium text-[#5E6278] dark:text-gray-700">
                            <FormattedMessage id="TRIPS.FIELD.MAX_SPEED" />
                          </span>
                        </div>
                        <div className="font-semibold text-sm text-[#2D3748] dark:text-gray-900">
                          {summary.maxSpeed.toFixed(0)} Km/h
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {animation && (
                  <button
                    className={clsx(
                      'btn btn-icon btn-sm rounded-full size-8 ml-2 hover:scale-110 transition-all duration-150 bg-transparent border-0',
                      selectedTrip === tripGroup && playing
                        ? 'text-green-500 hover:text-green-600'
                        : 'text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedTrip === tripGroup && playing) {
                        pause();
                      } else if (selectedTrip === tripGroup && !playing) {
                        play();
                      } else {
                        stop();
                        setSelectedTrip(tripGroup);
                        play();
                      }
                    }}
                    title={
                      selectedTrip === tripGroup && playing ? 'Pause trip group' : 'Play trip group'
                    }
                  >
                    {selectedTrip === tripGroup && playing ? (
                      <FaPause size={16} />
                    ) : (
                      <FaPlay size={16} />
                    )}
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1 py-[10px] font-medium text-[10px] text-[#0F0F0F] dark:text-gray-50 bg-[#F5F5FC] dark:bg-gray-200 px-[6px]">
                {tripGroup.trips.map((trip, idx) => (
                  <div
                    key={trip.id}
                    data-selected={selectedTrip === trip}
                    className="rounded-[10px] bg-white border border-[#E7E8ED] dark:bg-black dark:border-gray-200 py-2 px-1 data-[selected=true]:border-[#5271FF] data-[selected=true]:shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-150"
                    onClick={() => {
                      stop();
                      setSelectedTrip(selectedTrip === trip ? undefined : trip);
                    }}
                  >
                    <div className="flex gap-2 justify-between items-center border-b-2 border-dashed py-2 px-1">
                      <div className="text-sm text-[#3F4254] dark:text-gray-50 font-semibold">
                        {idx + 1}
                      </div>
                      {intervalType === IntervalType.Trip && (
                        <>
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-1 items-center">
                              <img src={toAbsoluteUrl('/media/icons/flag.svg')} />
                              <span className="text-[10px] font-medium text-[#5E6278] dark:text-gray-700">
                                <FormattedMessage id="TRIPS.FIELD.START_DATE" />
                              </span>
                            </div>
                            <div className="font-semibold text-[#2D3748] dark:text-gray-900">
                              {formatInTimeZone(
                                new Date(Number(trip.startDate) * 1000),
                                currentUser?.timezone || 'UTC',
                                'yyyy/MM/dd | HH:mm:ss'
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-1 items-center">
                              <img src={toAbsoluteUrl('/media/icons/destination.svg')} />
                              <span className="text-[10px] font-medium text-[#5E6278] dark:text-gray-700">
                                <FormattedMessage id="TRIPS.FIELD.END_DATE" />
                              </span>
                            </div>
                            <div className="font-semibold text-[#2D3748] dark:text-gray-900">
                              {formatInTimeZone(
                                new Date(Number(trip.endDate) * 1000),
                                currentUser?.timezone || 'UTC',
                                'yyyy/MM/dd | HH:mm:ss'
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      {animation && (
                        <button
                          className={clsx(
                            'btn btn-icon btn-sm rounded-full size-6 hover:scale-110 transition-all duration-150 bg-transparent border-0',
                            selectedTrip === trip && playing
                              ? 'text-green-500 hover:text-green-600'
                              : 'text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedTrip === trip && playing) {
                              pause();
                            } else if (selectedTrip === trip && !playing) {
                              play();
                            } else {
                              stop();
                              setSelectedTrip(trip);
                              play();
                            }
                          }}
                          title={selectedTrip === trip && playing ? 'Pause trip' : 'Play trip'}
                        >
                          {selectedTrip === trip && playing ? (
                            <FaPause size={14} />
                          ) : (
                            <FaPlay size={14} />
                          )}
                        </button>
                      )}
                    </div>
                    <div
                      className={clsx('grid gap-2.5 p-2', {
                        'grid-cols-3': intervalType === IntervalType.Trip,
                        'grid-cols-4': intervalType === IntervalType.Parking
                      })}
                    >
                      {intervalType === IntervalType.Parking && (
                        <>
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-1 items-center">
                              <img src={toAbsoluteUrl('/media/icons/flag.svg')} />
                              <span className="text-[10px] font-medium text-[#5E6278] dark:text-gray-700">
                                <FormattedMessage id="TRIPS.FIELD.START_DATE" />
                              </span>
                            </div>
                            <div className="font-semibold text-[#2D3748] dark:text-gray-900">
                              {formatInTimeZone(
                                new Date(Number(trip.startDate) * 1000),
                                currentUser?.timezone || 'UTC',
                                'yyyy/MM/dd HH:mm:ss'
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-1 items-center">
                              <img src={toAbsoluteUrl('/media/icons/destination.svg')} />
                              <span className="text-[10px] font-medium text-[#5E6278] dark:text-gray-700">
                                <FormattedMessage id="TRIPS.FIELD.END_DATE" />
                              </span>
                            </div>
                            <div className="font-semibold text-[#2D3748] dark:text-gray-900">
                              {formatInTimeZone(
                                new Date(Number(trip.endDate) * 1000),
                                currentUser?.timezone || 'UTC',
                                'yyyy/MM/dd HH:mm:ss'
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-1 items-center">
                              <img src={toAbsoluteUrl(`/media/icons/clock.svg`)} />
                              <span className="text-[10px] font-medium text-[#5E6278] dark:text-gray-700">
                                <FormattedMessage id="TRIPS.FIELD.TOTAL_DURATION" />
                              </span>
                            </div>
                            <div className="font-semibold text-[#2D3748] dark:text-gray-900">
                              {trip.formattedTotalDuration}
                            </div>
                          </div>
                        </>
                      )}
                      {intervalType === IntervalType.Trip && (
                        <>
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-1 items-center">
                              <img src={toAbsoluteUrl('/media/icons/meter.svg')} />
                              <span className="text-[10px] font-medium text-[#5E6278] dark:text-gray-700">
                                <FormattedMessage id="TRIPS.FIELD.MILEAGE" />
                              </span>
                            </div>
                            <div className="font-semibold text-[#2D3748] dark:text-gray-900">
                              {trip.mileage.toFixed(2)} KM
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-1 items-center">
                              <img src={toAbsoluteUrl('/media/icons/speed-blue.svg')} />
                              <span className="text-[10px] font-medium text-[#5E6278] dark:text-gray-700">
                                <FormattedMessage id="TRIPS.FIELD.MAX_SPEED" />
                              </span>
                            </div>
                            <div className="font-semibold text-[#2D3748] dark:text-gray-900">
                              {trip.maxSpeed.toFixed(0)} Km/h
                            </div>
                          </div>
                        </>
                      )}
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1 items-center">
                          <img src={toAbsoluteUrl('/media/icons/clock.svg')} />
                          <span className="text-[10px] font-medium text-[#5E6278] dark:text-gray-700">
                            <FormattedMessage id="TRIPS.TOTAL_IDLING" />
                          </span>
                        </div>
                        <div className="font-semibold text-[#2D3748] dark:text-gray-900">
                          {trip.totalIdling ? formatTotalDuration(trip.totalIdling) : 'NA'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Collapse>
      </div>
    </div>
  );
};

export default TripCard;
