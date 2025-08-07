import { MainCard } from './blocks/MainCard';
import { MainControl } from '../monitoring/blocks/MainControl';
import { TripsLayer } from './blocks/TripsLayer';
import { useTripsContext } from './providers/TripsContext';
import { SubControl } from '../monitoring/blocks/SubControl';
import { PlaybackCard } from './blocks/PlaybackCard';
import { AnimationProvider } from './providers/AnimationContext';
import AppMap from '@/components/AppMap';
import { useIntl } from 'react-intl';
import { IntervalType } from '@/api/trips';

const TripsMap = () => {
  const { path, intervalType } = useTripsContext();
  const intl = useIntl();

  return (
    <AppMap>
      <AnimationProvider>
        <TripsLayer />
        <MainControl title={intl.formatMessage({ id: 'SIDEBAR.MENU.TRIPS' })}>
          <MainCard />
        </MainControl>
        {path && intervalType === IntervalType.Trip && (
          <SubControl>
            <PlaybackCard />
          </SubControl>
        )}
      </AnimationProvider>
    </AppMap>
  );
};

export { TripsMap };
