import { ReservationDetails } from '@/api/reservations';
import { CheckIcon } from 'lucide-react';

const AdditionalFeatures = ({ reservation }: { reservation: ReservationDetails }) => {
  const additionalServices =
    reservation?.reservationItems?.filter((item) => item.additionalServiceType === 'service') || [];

  return (
    <div className="additional-features">
      {/* Virtual Insurance */}
      {reservation?.virtualInsurance && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
            <CheckIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm">Insurance</span>
        </div>
      )}

      {/* Additional Services */}
      {additionalServices.map((service) => (
        <div key={service.id} className="flex items-center gap-2 text-sm">
          <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
            <CheckIcon className="w-3 h-3 text-white" />
          </div>
          <span>
            {service.name} <span className="text-indigo-600"> +({service.price}$)</span>
          </span>
        </div>
      ))}
    </div>
  );
};

export default AdditionalFeatures;
