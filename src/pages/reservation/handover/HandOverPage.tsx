import { ReservationDetails } from '@/api/reservations';
import React, { useRef } from 'react';
import { RentalInfoBlock } from './blocks';
import { CarScratches } from './blocks/CarScratches';

export interface HandOverPageProps {
  reservation?: ReservationDetails | undefined;
}

export interface AddReservationPageProps {
  reservation?: ReservationDetails | undefined;
  isPickupFlow?: boolean;
  isDropoffFlow?: boolean;
}

const HandOverPage = ({ reservation }: HandOverPageProps) => {
  const rentalInfoRef = useRef<HTMLDivElement>(null);

  // Determine if this is pickup or dropoff based on fuelStatusAtPickup
  const isPickupDone = reservation?.fuelStatusAtPickup != null;
  const isDropoffFlow = isPickupDone;

  return (
    <div className="grid gap-5 lg:gap-7.5 xl:w-[60rem] mx-auto">
      <div ref={rentalInfoRef} className="flex flex-col gap-5">
        <RentalInfoBlock
          reservation={reservation}
          isPickupFlow={!isDropoffFlow}
          isDropoffFlow={isDropoffFlow}
        />
        <CarScratches vehicleId={reservation?.vehicleId || ''} />
      </div>
    </div>
  );
};

export { HandOverPage };
