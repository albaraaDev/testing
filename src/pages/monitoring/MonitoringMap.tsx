import { CarsLayer } from './blocks/CarsLayer';
import { MainControl } from './blocks/MainControl';
import { MainCard } from './blocks/MainCard';
import { SubControl } from './blocks/SubControl';
import { useMonitoringProvider } from './providers/MonitoringProvider';
import { LocationCard } from './blocks/LocationCard';
import { ShowImeiControl } from './blocks/ShowImeiControl';
import AppMap from '@/components/AppMap';
import { useIntl } from 'react-intl';

const MonitoringMap = () => {
  const { selectedLocation } = useMonitoringProvider();
  const intl = useIntl();

  return (
    <AppMap mapControls={<ShowImeiControl />}>
      <CarsLayer />
      <MainControl title={intl.formatMessage({ id: 'DASHBOARD.MONITORING.TITLE' })}>
        <MainCard />
      </MainControl>
      {selectedLocation && (
        <SubControl>
          <LocationCard />
        </SubControl>
      )}
    </AppMap>
  );
};

export { MonitoringMap };
