import React, { useEffect, useState } from 'react';
import { WorkingPeriodModel, getVehicleWorkingPeriods } from '@/api/working-hours';
import { FormattedMessage, useIntl } from 'react-intl';

interface VehicleWorkingPeriodsProps {
  vehicleId: string | undefined;
  className?: string;
}

const VehicleWorkingPeriods: React.FC<VehicleWorkingPeriodsProps> = ({
  vehicleId,
  className = ''
}) => {
  const [workingPeriods, setWorkingPeriods] = useState<WorkingPeriodModel[]>([]);
  const [loading, setLoading] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    const fetchWorkingPeriods = async () => {
      if (!vehicleId) return;

      try {
        setLoading(true);
        const periods = await getVehicleWorkingPeriods(vehicleId);
        setWorkingPeriods(periods);
      } catch (error) {
        console.error('Failed to fetch working periods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkingPeriods();
  }, [vehicleId]);

  // Map day abbreviations to full names for display
  const getDayName = (day: string) => {
    const days: Record<string, string> = {
      MONDAY: intl.formatMessage({ id: 'WORKING_HOURS.DAYS.MONDAY' }),
      TUESDAY: intl.formatMessage({ id: 'WORKING_HOURS.DAYS.TUESDAY' }),
      WEDNESDAY: intl.formatMessage({ id: 'WORKING_HOURS.DAYS.WEDNESDAY' }),
      THURSDAY: intl.formatMessage({ id: 'WORKING_HOURS.DAYS.THURSDAY' }),
      FRIDAY: intl.formatMessage({ id: 'WORKING_HOURS.DAYS.FRIDAY' }),
      SATURDAY: intl.formatMessage({ id: 'WORKING_HOURS.DAYS.SATURDAY' }),
      SUNDAY: intl.formatMessage({ id: 'WORKING_HOURS.DAYS.SUNDAY' })
    };
    return days[day] || day;
  };

  return (
    <div className={`p-6 rounded-lg card hover:shadow-md ${className}`}>
      <h2 className="text-xl font-semibold mb-4">
        <FormattedMessage
          id="VEHICLE.DETAILS.WORKING_PERIODS.TITLE"
          defaultMessage="Working Periods"
        />
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : workingPeriods.length > 0 ? (
        <div className="overflow-y-auto max-h-64">
          <ul className="space-y-4">
            {workingPeriods.map((period) => (
              <li key={period.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="font-medium text-lg mb-2">{period.name}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600">
                      <FormattedMessage
                        id="VEHICLE.DETAILS.WORKING_PERIODS.TIME"
                        defaultMessage="Time:"
                      />
                    </span>
                    <span className="ms-2">
                      {period.startTime} - {period.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      <FormattedMessage
                        id="VEHICLE.DETAILS.WORKING_PERIODS.DAYS"
                        defaultMessage="Days:"
                      />
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {period.daysOfWeek.map((day) => (
                        <span
                          key={day}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                        >
                          {getDayName(day)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <FormattedMessage
            id="VEHICLE.DETAILS.WORKING_PERIODS.EMPTY"
            defaultMessage="No working periods assigned to this vehicle"
          />
        </div>
      )}
    </div>
  );
};

export default VehicleWorkingPeriods;
