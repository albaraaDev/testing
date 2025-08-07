import React, { useRef } from 'react';
import { ReservationDetails } from '@/api/reservations';
import { RentalInfoBlock } from './blocks';

export interface AddReservationPageProps {
  reservation?: ReservationDetails | undefined;
}

const AddReservationPage = ({ reservation }: AddReservationPageProps) => {
  const rentalInfoRef = useRef<HTMLDivElement>(null);

  return (
    <div className="grid gap-5 lg:gap-7.5 xl:w-[60rem] mx-auto">
      <div ref={rentalInfoRef}>
        <RentalInfoBlock reservation={reservation} />
      </div>
    </div>
  );
};

export { AddReservationPage };
