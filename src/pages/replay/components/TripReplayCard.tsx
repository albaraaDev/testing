import { ReplayDTO } from '@/api/replay';
import { useReplayContext } from '../providers/ReplayContextHooks';
import { formatInTimeZone } from 'date-fns-tz';
import { useAuthContext } from '@/auth';
import clsx from 'clsx';
import { HalfCircleProgressBar } from '@/components';
import { useMemo } from 'react';

type TripReplayCardProps = {
  trip: ReplayDTO;
};

export default function TripReplayCard({ trip }: TripReplayCardProps) {
  const { selectedIntervals, handleIntervalSelection } = useReplayContext();
  const isSelected = useMemo(
    () => selectedIntervals?.some((interval) => interval === trip.id),
    [selectedIntervals, trip.id]
  );
  const { currentUser } = useAuthContext();

  const timezone = currentUser?.timezone || 'UTC';

  return (
    <div
      key={trip.id}
      data-selected={isSelected}
      className={clsx(
        'rounded-lg border p-2 h-full flex justify-center items-center cursor-pointer',
        isSelected
          ? 'border-green-500 bg-green-100 dark:border-green-500 dark:bg-green-500/20'
          : 'border-green-100 bg-green-50 dark:border-green-500/10 dark:bg-green-500/10'
      )}
      onClick={() => handleIntervalSelection(trip)}
      onKeyDown={(e) => e.key === 'Enter' && handleIntervalSelection(trip)}
      tabIndex={0}
      role="checkbox"
      aria-pressed={isSelected}
    >
      <div className="flex items-center gap-2">
        <div className="flex gap-2 items-center">
          <div className="flex-col gap-2 items-center justify-center w-16 me-1">
            <div className="flex gap-1 items-center text-sm text-nowrap dark:text-white">
              {trip.totalDistance.toFixed(2)} KM
            </div>
            <div className="text-xs text-gray-600 text dark:text-white/80">
              {trip.formatedTotalDuration.replace(/\s\d+\s\w+$/, '')}
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <div className="size-4 rounded-full border-green-500 bg-white border-4" />
            <div className="w-1 rounded-full h-14 bg-neutral-300/50 grow" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium dark:text-white">
            {formatInTimeZone(new Date(trip.startTime * 1000), timezone, 'yyyy/MM/dd')}
          </div>
          <div className="text-xs text-gray-600 dark:text-white/80">
            {formatInTimeZone(new Date(trip.startTime * 1000), timezone, 'HH:mm:ss')}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium dark:text-white">
            {formatInTimeZone(new Date(trip.endTime * 1000), timezone, 'yyyy/MM/dd')}
          </div>
          <div className="text-xs text-gray-600 dark:text-white/80">
            {formatInTimeZone(new Date(trip.endTime * 1000), timezone, 'HH:mm:ss')}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-[85px]">
          <HalfCircleProgressBar
            value={trip.maxSpeed}
            maxValue={160}
            unit="Km/h"
            animated={false}
          />
        </div>
      </div>
    </div>
  );
}
