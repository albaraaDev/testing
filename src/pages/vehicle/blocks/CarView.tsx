import { Vehicle } from '@/api/cars.ts';
import { KeenIcon } from '@/components';
import Image from '@/components/image/Image';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';

export interface CarViewProps {
  vehicle: Vehicle;
}

export const CarView = ({ vehicle }: CarViewProps) => {
  return (
    <div className="flex flex-col gap-1 px-2">
      <div className="flex gap-2 items-center">
        <Image
          src={vehicle.brandImage}
          className="size-9 object-cover"
          fallback={
            <div className="bg-neutral-200 size-10 aspect-square rounded-full flex items-center justify-center">
              <KeenIcon style="duotone" icon="car" className="text-black" />
            </div>
          }
        />
        <CarPlate plate={vehicle.plate} />
      </div>
      <div className="text-gray-600 text-2sm">{vehicle.imei}</div>
    </div>
  );
};
