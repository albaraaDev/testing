import { EngineHours, FuelConsumption, Mileage } from '@/assets/svg';
import { useSettings } from '@/providers';
import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useIntl } from 'react-intl';

interface MetricCardProps {
  icon: React.ComponentType;
  label: string;
  value: string | number;
  percentage: number;
  color: string;
}

interface VehicleMetricsData {
  engineHours?: string;
  mileage?: string;
  fuelConsumption?: string;
}

interface ReservationMetrics {
  engineHours?: string;
  engineHoursPercentage?: number;
  fuelConsumptionRate?: string;
  fuelConsumptionRatePercentage?: number;
  reservationMileage?: string;
  reservationMileagePercentage?: number;
  fuelTankAtDelivery?: string;
  fuelTankAtDeliveryPercentage?: number;
  mileageAtDelivery?: string;
  mileageAtDeliveryPercentage?: number;
}

interface VehicleMetricsProps {
  metrics?: VehicleMetricsData;
  reservationMetrics?: ReservationMetrics;
  mode?: 'vehicle' | 'reservation';
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, percentage, color }) => {
  const { settings } = useSettings();
  return (
    <div className="card hover:shadow-md p-4 rounded-lg text-center flex flex-col items-center justify-center flex-1">
      <div className="mb-2">
        <Icon />
      </div>
      <p className="text-lg font-medium text-gray-900 m-2 min-h-14">{label}</p>
      <div className="w-24 h-24 mb-3">
        <CircularProgressbar
          value={percentage}
          text={value.toString()}
          styles={buildStyles({
            textSize: '14px',
            pathColor: color,
            textColor: settings.themeMode === 'dark' ? '#E5E7EB' : '#374151',
            trailColor: settings.themeMode === 'dark' ? '#374151' : '#D1D5DB',
            pathTransitionDuration: 0.5
          })}
        />
      </div>
    </div>
  );
};

const VehicleMetrics: React.FC<VehicleMetricsProps> = ({
  metrics = {
    engineHours: '250 Hr',
    mileage: '157 km',
    fuelConsumption: '9%'
  },
  reservationMetrics,
  mode = 'vehicle'
}) => {
  const intl = useIntl();

  // Vehicle mode configuration
  const vehicleMetricConfigs: MetricCardProps[] = [
    {
      icon: EngineHours,
      label: intl.formatMessage({ id: 'VEHICLE.METRICS.ENGINE_HOURS' }),
      value: metrics.engineHours || 'N/A',
      percentage: 70,
      color: '#F87171'
    },
    {
      icon: Mileage,
      label: intl.formatMessage({ id: 'VEHICLE.METRICS.MILEAGE' }),
      value: metrics.mileage || 'N/A',
      percentage: 80,
      color: '#60A5FA'
    },
    {
      icon: FuelConsumption,
      label: intl.formatMessage({ id: 'VEHICLE.METRICS.FUEL_CONSUMPTION' }),
      value: metrics.fuelConsumption || 'N/A',
      percentage: 25,
      color: '#A78BFA'
    }
  ];

  // Reservation mode configuration - using pre-calculated percentages
  const reservationMetricConfigs: MetricCardProps[] = [];

  if (reservationMetrics?.engineHours) {
    reservationMetricConfigs.push({
      icon: EngineHours,
      label: intl.formatMessage({ id: 'RESERVATION.METRICS.ENGINE_HOURS' }),
      value: reservationMetrics.engineHours,
      percentage: reservationMetrics.engineHoursPercentage || 0,
      color: '#FF7E86'
    });
  }

  if (reservationMetrics?.fuelConsumptionRate) {
    reservationMetricConfigs.push({
      icon: FuelConsumption,
      label: intl.formatMessage({ id: 'RESERVATION.METRICS.FUEL_CONSUMPTION_RATE' }),
      value: reservationMetrics.fuelConsumptionRate,
      percentage: reservationMetrics.fuelConsumptionRatePercentage || 0,
      color: '#A162F7'
    });
  }

  if (reservationMetrics?.reservationMileage) {
    reservationMetricConfigs.push({
      icon: Mileage,
      label: intl.formatMessage({ id: 'RESERVATION.METRICS.RESERVATION_MILEAGE' }),
      value: reservationMetrics.reservationMileage,
      percentage: reservationMetrics.reservationMileagePercentage || 0,
      color: '#FFA800'
    });
  }

  if (reservationMetrics?.fuelTankAtDelivery) {
    reservationMetricConfigs.push({
      icon: FuelConsumption,
      label: intl.formatMessage({ id: 'RESERVATION.METRICS.FUEL_TANK_AT_DELIVERY' }),
      value: reservationMetrics.fuelTankAtDelivery,
      percentage: reservationMetrics.fuelTankAtDeliveryPercentage || 0,
      color: '#F1416C'
    });
  }

  if (reservationMetrics?.mileageAtDelivery) {
    reservationMetricConfigs.push({
      icon: Mileage,
      label: intl.formatMessage({ id: 'RESERVATION.METRICS.MILEAGE_AT_DELIVERY' }),
      value: reservationMetrics.mileageAtDelivery,
      percentage: reservationMetrics.mileageAtDeliveryPercentage || 0,
      color: '#FFA800'
    });
  }

  const activeConfigs = mode === 'reservation' ? reservationMetricConfigs : vehicleMetricConfigs;

  // Don't render if no metrics available for reservation mode
  if (mode === 'reservation' && activeConfigs.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 grow">
      {activeConfigs.map((config, index) => (
        <MetricCard key={index} {...config} />
      ))}
    </div>
  );
};

export default VehicleMetrics;
