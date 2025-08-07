import { CustomerDetails, getCustomerDetails } from '@/api/customers';
import { getReservationDetails, ReservationDetails } from '@/api/reservations';
import { Container } from '@/components';
import TripList from '@/components/blocks/TripList';
import VehicleMetrics from '@/components/blocks/VehicleMetrics';
import VehicleScratchesDisplay from '@/components/blocks/VehicleScratchesDisplay';
import FileList from '@/components/FileList';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import { MaintenanceViolationTable } from '@/pages/dashboards/blocks/maintenance';
import { useAppRouting } from '@/routing/useAppRouting';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router';
import AdditionalFeatures from './blocks/AdditionalFeatures';
import PayAndDayDetails from './blocks/PayAndDayDetails';
import ReservationCustomerDetail from './blocks/ReservationCustomerDetail';
import Toolbar from './blocks/Toolbar';

const ReservationDetailsPage = () => {
  const intl = useIntl();
  const { id } = useParams();
  const navigate = useAppRouting();
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);

  const refetchReservation = useCallback(() => {
    if (!id) return;
    getReservationDetails(id)
      .then((data) => {
        setReservation(data);
        // Fetch customer details if we have customer ID
        if (data.customerId) {
          getCustomerDetails(data.customerId)
            .then(setCustomer)
            .catch(() => {
              // Customer fetch failed, but we can still show reservation details
              console.warn('Failed to fetch customer details');
            });
        }
      })
      .catch(() => {
        navigate('/error/404');
      });
  }, [id, navigate]);

  useEffect(() => {
    refetchReservation();
  }, [refetchReservation]);

  const files = useMemo(() => {
    if (!reservation) return [];

    return [
      {
        name: intl.formatMessage({ id: 'RESERVATIONS.DOCUMENTS.IMAGE_AT_PICKUP' }),
        url: reservation.imageAtPickup ?? undefined
      },
      {
        name: intl.formatMessage({ id: 'RESERVATIONS.DOCUMENTS.VIDEO_AT_PICKUP' }),
        url: reservation.videoAtPickup ?? undefined
      },
      {
        name: intl.formatMessage({ id: 'RESERVATIONS.DOCUMENTS.IMAGE_AT_DROPOFF' }),
        url: reservation.imageAtDropOff ?? undefined
      },
      {
        name: intl.formatMessage({ id: 'RESERVATIONS.DOCUMENTS.VIDEO_AT_DROPOFF' }),
        url: reservation.videoAtDropOff ?? undefined
      }
    ];
  }, [reservation, intl]);

  const reservationMetrics = useMemo(() => {
    if (!reservation) return undefined;

    // Helper function to extract numeric value from string
    const extractNumericValue = (value: string | number): number => {
      if (typeof value === 'number') return value;
      const numericValue = parseFloat(value.toString().replace(/[^\d.]/g, ''));
      return isNaN(numericValue) ? 0 : numericValue;
    };

    // Helper function to calculate realistic percentages
    const calculateRealisticPercentage = (value: string | number, metricType: string): number => {
      const numericValue = extractNumericValue(value);

      switch (metricType) {
        case 'engineHours': {
          const maxReasonableHours = 72; // 3 days maximum for most reservations
          return Math.min((numericValue / maxReasonableHours) * 100, 100);
        }
        case 'fuelConsumptionRate': {
          const maxReasonableFuelRate = 3; // 3 TL/KM is high consumption
          return Math.min((numericValue / maxReasonableFuelRate) * 100, 100);
        }
        case 'reservationMileage': {
          const maxReasonableMileage = 1000; // 1000 KM for single reservation
          return Math.min((numericValue / maxReasonableMileage) * 100, 100);
        }
        case 'fuelTankAtDelivery':
          return Math.min(Math.max(numericValue, 0), 100);
        case 'mileageAtDelivery': {
          const maxCarMileage = 200000; // 200K KM car lifetime
          return Math.min((numericValue / maxCarMileage) * 100, 100);
        }

        default:
          return 0;
      }
    };

    const metrics: any = {
      engineHours: '0 Hr',
      engineHoursPercentage: 0,
      fuelConsumptionRate: '0 TL/KM',
      fuelConsumptionRatePercentage: 0,
      reservationMileage: '0 KM',
      reservationMileagePercentage: 0,
      fuelTankAtDelivery: '0%',
      fuelTankAtDeliveryPercentage: 0,
      mileageAtDelivery: '0 KM',
      mileageAtDeliveryPercentage: 0
    };

    // Calculate engine hours
    if (reservation.pickUpDate && reservation.dropOffDate) {
      const pickupDate = new Date(reservation.pickUpDate + 'T' + reservation.pickUpTime);
      const dropoffDate = new Date(reservation.dropOffDate + 'T' + reservation.dropOffTime);
      const hoursDiff = Math.abs(dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60);
      metrics.engineHours = `${Math.round(hoursDiff)} Hr`;
      metrics.engineHoursPercentage = calculateRealisticPercentage(
        Math.round(hoursDiff),
        'engineHours'
      );
    }

    // Calculate fuel consumption rate
    if (reservation.fuelPrice && reservation.mileageAtDropOff && reservation.mileageAtPickup) {
      const totalMileage = reservation.mileageAtDropOff - reservation.mileageAtPickup;
      if (totalMileage > 0) {
        const consumptionRate = reservation.fuelPrice / totalMileage;
        metrics.fuelConsumptionRate = `${consumptionRate.toFixed(2)} TL/KM`;
        metrics.fuelConsumptionRatePercentage = calculateRealisticPercentage(
          consumptionRate,
          'fuelConsumptionRate'
        );
      }
    }

    // Calculate reservation mileage
    if (reservation.mileageAtDropOff && reservation.mileageAtPickup) {
      const totalMileage = reservation.mileageAtDropOff - reservation.mileageAtPickup;
      metrics.reservationMileage = `${totalMileage} KM`;
      metrics.reservationMileagePercentage = calculateRealisticPercentage(
        totalMileage,
        'reservationMileage'
      );
    }

    // Fuel tank at delivery (pickup)
    if (reservation.fuelStatusAtPickup !== null && reservation.fuelStatusAtPickup !== undefined) {
      metrics.fuelTankAtDelivery = `${reservation.fuelStatusAtPickup}%`;
      metrics.fuelTankAtDeliveryPercentage = calculateRealisticPercentage(
        reservation.fuelStatusAtPickup,
        'fuelTankAtDelivery'
      );
    }

    // Mileage at delivery (pickup)
    if (reservation.mileageAtPickup !== null && reservation.mileageAtPickup !== undefined) {
      metrics.mileageAtDelivery = `${reservation.mileageAtPickup} KM`;
      metrics.mileageAtDeliveryPercentage = calculateRealisticPercentage(
        reservation.mileageAtPickup,
        'mileageAtDelivery'
      );
    }

    return Object.keys(metrics).length > 0 ? metrics : undefined;
  }, [reservation]);

  if (!id) {
    navigate('/error/404');
    return null;
  }

  if (!reservation) {
    return null;
  }

  return (
    <Container className="mb-10 flex flex-col gap-6">
      <Toolbar />
      <ReservationCustomerDetail reservation={reservation} customer={customer} />
      {reservationMetrics && (
        <VehicleMetrics reservationMetrics={reservationMetrics} mode="reservation" />
      )}
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card p-4 col-span-1">
            <div className="flex justify-between">
              {/* Car Plate */}
              <div className="flex items-center justify-center mb-4">
                <CarPlate plate={reservation?.vehiclePlate || 'NA'} />
              </div>

              {/* Device Section */}
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-4 rounded-full"></div>
                <div>
                  <span className="text-lg font-medium">{reservation?.deviceIdent || 'NA'}</span>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="VEHICLE.DETAILS.DEVICE" />
                  </p>
                </div>
              </div>
            </div>
            {/* Image Section */}
            <VehicleScratchesDisplay vehicleId={reservation?.vehicleId} />
          </div>
          <div className="card p-6 col-span-2">
            <div className="border border-dashed border-gray-300 rounded-lg p-4">
              <h2 className="font-semibold mb-4 text-dark dark:text-white/70">
                <FormattedMessage id="RESERVATION.ADDITIONAL_FEATURES.TITLE" />
              </h2>
              <AdditionalFeatures reservation={reservation} />
            </div>
            <PayAndDayDetails reservation={reservation} />
          </div>
        </div>
      </div>
      <TripList vehicleId={reservation?.vehicleId} ident={reservation?.deviceIdent} />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="">
          <h2 className="text-xl font-semibold mb-4 ps-4">
            <FormattedMessage id="VEHICLE.DETAILS.DOCUMENTS" />
          </h2>
          <FileList files={files} />
        </div>
      </div>
      {/* MaintenanceViolationTable */}
      <div className="w-full mt-6  max-w-[95vw] overflow-hidden">
        {reservation && (
          <MaintenanceViolationTable id={reservation?.vehicleId} context="reservation" />
        )}
      </div>
    </Container>
  );
};

export default ReservationDetailsPage;
