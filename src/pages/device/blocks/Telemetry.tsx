import SpeedGauge from '../SpeedGuage';
import Car from '../Car';
import Map from '../Map';
import { FormattedMessage } from 'react-intl';
import { toAbsoluteUrl } from '@/utils';

type TelemetryProps = {
  parameters: Record<string, { data: any; timestamp: Date; latest: boolean }>;
};

const Telemetry = ({ parameters }: TelemetryProps) => {
  return (
    <div className="flex justify-between gap-4">
      {/* Speed Gauge */}
      <div className="flex items-center justify-start">
        <div className="card flex flex-col max-w-sm p-4 w-96">
          <SpeedGauge value={parameters['position_speed']?.data} maxValue={160} />

          <div className="flex gap-4 justify-between items-center mt-4 bg-neutral-100 dark:bg-gray-200 p-4 rounded-lg">
            <div>
              <div className="flex gap-1 items-center">
                <img src={toAbsoluteUrl('/media/icons/flag.svg')} />
                <span className="text-xs font-medium text-[#5E6278] dark:text-gray-700">
                  <FormattedMessage id="DEVICE.TELEMETRY.PARKING_TIME" />:
                </span>
              </div>
              <span className="font-semibold text-dark dark:text-white text-md">
                {parameters['parking_time']?.data ?? '?'}
              </span>
            </div>
            <div>
              <div className="flex gap-1 items-center">
                <img src={toAbsoluteUrl('/media/icons/speed-blue.svg')} />
                <span className="text-xs font-medium text-[#5E6278] dark:text-gray-700">
                  <FormattedMessage id="DEVICE.TELEMETRY.EXISTING_KILOMETERS" />:
                </span>
              </div>
              <span className="font-semibold text-dark dark:text-white text-md">
                {parameters['existing_kilometers']?.data ?? '?'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex flex-1 items-center justify-center">
        <Map
          location={
            parameters['position_latitude']?.data &&
            parameters['position_longitude']?.data && {
              lat: parameters['position_latitude']?.data,
              lng: parameters['position_longitude']?.data
            }
          }
          direction={parameters['position_direction']?.data}
          engineStatus={parameters['engine_ignition_status']?.data}
          online={parameters['status']?.data === 'online'}
        />
      </div>

      {/* Car */}
      <div className="flex items-center justify-end">
        <Car direction={parameters['position_direction']?.data} />
      </div>
    </div>
  );
};

export default Telemetry;
