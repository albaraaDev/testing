import { ReplayDTO } from '@/api/replay';
import { useReplayContext } from '../providers/ReplayContextHooks';
import { formatInTimeZone } from 'date-fns-tz';
import { useAuthContext } from '@/auth';
import clsx from 'clsx';
import { FormattedMessage } from 'react-intl';
import { useMemo } from 'react';

type ParkingReplayCardProps = {
  parking: ReplayDTO;
};

export default function ParkingReplayCard({ parking }: ParkingReplayCardProps) {
  const { selectedIntervals, handleIntervalSelection } = useReplayContext();
  const isSelected = useMemo(
    () => selectedIntervals?.some((interval) => interval === parking.id),
    [selectedIntervals, parking.id]
  );
  const { currentUser } = useAuthContext();

  const timezone = currentUser?.timezone || 'UTC';

  return (
    <div
      key={parking.id}
      data-selected={isSelected}
      className={clsx(
        'rounded-lg border p-2 h-full flex justify-start items-center cursor-pointer',
        isSelected
          ? 'border-orange-500 bg-orange-100 dark:border-orange-500 dark:bg-orange-500/20'
          : 'border-orange-100 bg-orange-50 dark:border-orange-500/10 dark:bg-orange-500/10'
      )}
      onClick={() => handleIntervalSelection(parking)}
      onKeyDown={(e) => e.key === 'Enter' && handleIntervalSelection(parking)}
      tabIndex={0}
      role="checkbox"
      aria-pressed={isSelected}
    >
      <div className="flex items-center gap-2">
        <div className="flex gap-2 items-center">
          <div className="flex-col gap-2 items-center justify-center w-16 me-1">
            <div className="flex gap-1 items-center text-sm text-nowrap dark:text-white">
              <FormattedMessage id="REPLAY.PARKING.PARKED" />
            </div>
            <div className="text-xs text-gray-600 dark:text-white/80">
              {parking.formatedTotalDuration.replace(/\s\d+\s\w+$/, '')}
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <div className="size-4 rounded-full border-orange-500 bg-white border-4" />
            <div className="w-1 rounded-full h-14 bg-neutral-300/50 grow" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium dark:text-white">
            {formatInTimeZone(new Date(parking.startTime * 1000), timezone, 'yyyy/MM/dd')}
          </div>
          <div className="text-xs text-gray-600 dark:text-white/80">
            {formatInTimeZone(new Date(parking.startTime * 1000), timezone, 'HH:mm:ss')}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium dark:text-white">
            {formatInTimeZone(new Date(parking.endTime * 1000), timezone, 'yyyy/MM/dd')}
          </div>
          <div className="text-xs text-gray-600 dark:text-white/80">
            {formatInTimeZone(new Date(parking.endTime * 1000), timezone, 'HH:mm:ss')}
          </div>
        </div>
      </div>
    </div>
  );
}
