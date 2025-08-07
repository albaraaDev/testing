import { CustomerDetails, getCustomerDetails } from '@/api/customers';
import { getReservationDetails, ReservationDetails } from '@/api/reservations';
import { Container } from '@/components';
import FileList, { FileInfo } from '@/components/FileList';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import { MaintenanceViolationTable } from '@/pages/dashboards/blocks/maintenance';
import VehicleScratchesDisplay from '@/pages/vehicle/add-vehicle/blocks/VehicleScratchesDisplay';
import VehicleMetrics from '@/pages/vehicle/blocks/details-components/VehicleMetrics';
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

    const files: FileInfo[] = [];

    if (reservation.imageAtPickup) {
      files.push({
        name: intl.formatMessage({ id: 'RESERVATIONS.DOCUMENTS.IMAGE_AT_PICKUP' }),
        url: reservation.imageAtPickup ?? undefined
      });
    }
    if (reservation.videoAtPickup) {
      files.push({
        name: intl.formatMessage({ id: 'RESERVATIONS.DOCUMENTS.VIDEO_AT_PICKUP' }),
        url: reservation.videoAtPickup ?? undefined
      });
    }
    if (reservation.imageAtDropOff) {
      files.push({
        name: intl.formatMessage({ id: 'RESERVATIONS.DOCUMENTS.IMAGE_AT_DROPOFF' }),
        url: reservation.imageAtDropOff ?? undefined
      });
    }
    if (reservation.videoAtDropOff) {
      files.push({
        name: intl.formatMessage({ id: 'RESERVATIONS.DOCUMENTS.VIDEO_AT_DROPOFF' }),
        url: reservation.videoAtDropOff ?? undefined
      });
    }

    return files;
  }, [reservation, intl]);

  const reservationMetrics = useMemo(() => {
    if (!reservation) return undefined;

    const metrics: any = {
      engineHours: '0 Hr',
      fuelConsumptionRate: '0 TL/KM',
      reservationMileage: '0 KM',
      fuelTankAtDelivery: '0%',
      mileageAtDelivery: '0 KM'
    };

    // Calculate engine hours if we have pickup and dropoff data
    if (reservation.pickUpDate && reservation.dropOffDate) {
      const pickupDate = new Date(reservation.pickUpDate + 'T' + reservation.pickUpTime);
      const dropoffDate = new Date(reservation.dropOffDate + 'T' + reservation.dropOffTime);
      const hoursDiff = Math.abs(dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60);
      metrics.engineHours = `${Math.round(hoursDiff)} Hr`;
    }

    // Calculate fuel consumption rate if we have fuel price and mileage
    if (reservation.fuelPrice && reservation.mileageAtDropOff && reservation.mileageAtPickup) {
      const totalMileage = reservation.mileageAtDropOff - reservation.mileageAtPickup;
      if (totalMileage > 0) {
        const consumptionRate = reservation.fuelPrice / totalMileage;
        metrics.fuelConsumptionRate = `${consumptionRate.toFixed(2)} TL/KM`;
      }
    }

    // Calculate reservation mileage
    if (reservation.mileageAtDropOff && reservation.mileageAtPickup) {
      const totalMileage = reservation.mileageAtDropOff - reservation.mileageAtPickup;
      metrics.reservationMileage = `${totalMileage} KM`;
    }

    // Fuel tank at delivery (pickup)
    if (reservation.fuelStatusAtPickup !== null && reservation.fuelStatusAtPickup !== undefined) {
      metrics.fuelTankAtDelivery = `${reservation.fuelStatusAtPickup}%`;
    }

    // Mileage at delivery (pickup)
    if (reservation.mileageAtPickup !== null && reservation.mileageAtPickup !== undefined) {
      metrics.mileageAtDelivery = `${reservation.mileageAtPickup} KM`;
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
      <div className="flex flex-col lg:flex-row">
        <div className="card hover:shadow-md w-full lg:w-1/2 grid grid-cols-1 mb-2 p-4">
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
        <div className="container px-2 mx-auto pl-5 grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
          <div className="card p-6">
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

      <div className="grid md:grid-cols-3 gap-6">
        <div className="">
          <h2 className="text-xl font-semibold mb-4 ps-4">
            <FormattedMessage id="VEHICLE.DETAILS.DOCUMENTS" />
          </h2>
          <FileList files={files} />
        </div>
      </div>
      {/* MaintenanceViolationTable */}
      <div className="w-full mt-6">
        {reservation && <MaintenanceViolationTable id={reservation?.vehicleId} />}
      </div>
    </Container>
  );
};

export default ReservationDetailsPage;
