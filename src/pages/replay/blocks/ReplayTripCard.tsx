import { ReplayDTO } from '@/api/replay';
import { IntervalType } from '@/api/trips';
import TripReplayCard from '../components/TripReplayCard';
import ParkingReplayCard from '../components/ParkingReplayCard';

interface ReplayTripCardProps {
  trips: ReplayDTO[];
}

export default function ReplayTripCard({ trips }: ReplayTripCardProps) {
  if (trips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-2 overflow-y-auto max-h-[60vh] md:w-[411px]">
      <div className="flex flex-col gap-3 py-[10px] font-medium text-[10px] text-[#0F0F0F] dark:text-gray-50">
        {trips.map((trip) => {
          if (trip.intervalType === IntervalType.Trip) {
            return (
              <div className="h-24" key={trip.id}>
                <TripReplayCard trip={trip} />
              </div>
            );
          }
          if (trip.intervalType === IntervalType.Parking) {
            return (
              <div className="h-24" key={trip.id}>
                <ParkingReplayCard parking={trip} />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
