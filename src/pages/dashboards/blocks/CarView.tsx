import { Vehicle } from '@/api/cars';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import Image from '@/components/image/Image';
import { KeenIcon } from '@/components';

export interface CarViewProps {
  vehicle: Vehicle;
  showBrand?: boolean;
}

export const CarView = ({ vehicle, showBrand = true }: CarViewProps) => {
  return (
    <div className="flex gap-2 items-center">
      {showBrand && (
        <Image
          src={vehicle.brandImage}
          alt={vehicle.name}
          title={vehicle.name}
          className="size-9 object-cover aspect-square"
          fallback={
            <div className="bg-neutral-200 size-9 aspect-square rounded-full flex items-center justify-center">
              <KeenIcon style="duotone" icon="car" className="text-black" />
            </div>
          }
        />
      )}
      <div className="flex flex-col gap-1">
        <CarPlate plate={vehicle.plate} />
        <div className="text-gray-600 text-2sm pl-2 font-monospace">{vehicle.imei}</div>
      </div>
    </div>
  );
};
