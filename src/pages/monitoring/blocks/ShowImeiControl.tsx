/* eslint-disable prettier/prettier */
import { toAbsoluteUrl } from '@/utils';
import { useMonitoringProvider } from '../providers/MonitoringProvider';

export const ShowImeiControl = () => {
  const { setShowImei, showImei } = useMonitoringProvider();

  return (
    <div className="bg-white rounded-lg shadow-lg cursor-pointer">
      <div
        className="size-[47px] flex justify-center items-center"
        onClick={() => setShowImei(!showImei)}
      >
        <img src={toAbsoluteUrl(`/media/icons/tooltip-${showImei ? "show" : "hide"}.svg`)} width={28} height={28} />
      </div>
    </div>
  );
};
