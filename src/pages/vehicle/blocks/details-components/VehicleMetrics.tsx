import { useSettings } from '@/providers';
import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useIntl } from 'react-intl';
import { EngineHours, FuelConsumption, Mileage } from '../svg';

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

interface CalculationData {
  maxEngineHours?: number;
  optimalFuelRate?: number;
  expectedMileage?: number;
  maxOdometerReading?: number;
}

interface ReservationMetrics {
  engineHours?: string;
  fuelConsumptionRate?: string; // TL/KM
  reservationMileage?: string;
  fuelTankAtDelivery?: string;
  mileageAtDelivery?: string;
}

interface VehicleMetricsProps {
  metrics?: VehicleMetricsData;
  reservationMetrics?: ReservationMetrics;
  calculationData?: CalculationData;
  mode?: 'vehicle' | 'reservation';
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, percentage, color }) => {
  const { settings } = useSettings();
  return (
    <div className="card hover:shadow-md p-4 rounded-lg text-center flex flex-col items-center justify-center flex-1">
      <div className="mb-2">
        <Icon />
      </div>
      <p className="text-lg font-medium text-gray-900 m-2">{label}</p>
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
  calculationData = {},
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

  // Helper function to calculate percentage
  const calculatePercentage = (
    value: string | number,
    maxValue: number,
    isInverse: boolean = false
  ): number => {
    const numericValue =
      typeof value === 'string' ? parseFloat(value.replace(/[^\d.]/g, '')) : value;

    if (isNaN(numericValue) || maxValue === 0) return 0;

    const percentage = (numericValue / maxValue) * 100;

    if (isInverse) {
      return Math.max(0, Math.min(100, 100 - percentage));
    }

    return Math.max(0, Math.min(100, percentage));
  };

  // Reservation mode configuration
  const reservationMetricConfigs: MetricCardProps[] = [];

  if (reservationMetrics?.engineHours) {
    const percentage = calculationData.maxEngineHours
      ? calculatePercentage(reservationMetrics.engineHours, calculationData.maxEngineHours)
      : 70;

    reservationMetricConfigs.push({
      icon: EngineHours,
      label: intl.formatMessage({ id: 'RESERVATION.METRICS.ENGINE_HOURS' }),
      value: reservationMetrics.engineHours,
      percentage,
      color: '#FF7E86'
    });
  }

  if (reservationMetrics?.fuelConsumptionRate) {
    const percentage = calculationData.optimalFuelRate
      ? calculatePercentage(
          reservationMetrics.fuelConsumptionRate,
          calculationData.optimalFuelRate,
          true
        )
      : 60;

    reservationMetricConfigs.push({
      icon: FuelConsumption,
      label: intl.formatMessage({ id: 'RESERVATION.METRICS.FUEL_CONSUMPTION_RATE' }),
      value: reservationMetrics.fuelConsumptionRate,
      percentage,
      color: '#A162F7'
    });
  }

  if (reservationMetrics?.reservationMileage) {
    const percentage = calculationData.expectedMileage
      ? calculatePercentage(reservationMetrics.reservationMileage, calculationData.expectedMileage)
      : 80;

    reservationMetricConfigs.push({
      icon: Mileage,
      label: intl.formatMessage({ id: 'RESERVATION.METRICS.RESERVATION_MILEAGE' }),
      value: reservationMetrics.reservationMileage,
      percentage,
      color: '#FFA800'
    });
  }

  if (reservationMetrics?.fuelTankAtDelivery) {
    const fuelPercentage = parseFloat(reservationMetrics.fuelTankAtDelivery.replace('%', ''));

    reservationMetricConfigs.push({
      icon: FuelConsumption,
      label: intl.formatMessage({ id: 'RESERVATION.METRICS.FUEL_TANK_AT_DELIVERY' }),
      value: reservationMetrics.fuelTankAtDelivery,
      percentage: isNaN(fuelPercentage) ? 90 : fuelPercentage,
      color: '#F1416C'
    });
  }

  if (reservationMetrics?.mileageAtDelivery) {
    const percentage = calculationData.maxOdometerReading
      ? calculatePercentage(
          reservationMetrics.mileageAtDelivery,
          calculationData.maxOdometerReading
        )
      : 75;

    reservationMetricConfigs.push({
      icon: Mileage,
      label: intl.formatMessage({ id: 'RESERVATION.METRICS.MILEAGE_AT_DELIVERY' }),
      value: reservationMetrics.mileageAtDelivery,
      percentage,
      color: '#FFA800'
    });
  }

  const activeConfigs = mode === 'reservation' ? reservationMetricConfigs : vehicleMetricConfigs;

  // Don't render if no metrics available for reservation mode
  if (mode === 'reservation' && activeConfigs.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 grow">
      {activeConfigs.map((config, index) => (
        <MetricCard key={index} {...config} />
      ))}
    </div>
  );
};

export default VehicleMetrics;
