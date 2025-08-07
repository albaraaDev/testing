import ReplayMainCard from './blocks/ReplayMainCard';
import { MainControl } from '../monitoring/blocks/MainControl';
import { SubControl } from '../monitoring/blocks/SubControl';
import AppMap from '@/components/AppMap';
import { useIntl } from 'react-intl';
import { ReplayLayer } from './blocks/ReplayLayer';
import { ReplayAnimationProvider } from './providers/ReplayAnimationContext';
import { ReplayPlaybackCard } from './blocks/ReplayPlaybackCard';
import { IntervalType } from '@/api/trips';
import { useMemo } from 'react';
import { useReplayContext } from './providers/ReplayContextHooks';

const ReplayMap = () => {
  const { selectedIntervalsData } = useReplayContext();
  const intl = useIntl();

  const hasSelectedTrips = useMemo(() => {
    if (!selectedIntervalsData) return false;
    return Object.values(selectedIntervalsData).some(
      (interval) => interval.intervalType === IntervalType.Trip
    );
  }, [selectedIntervalsData]);

  return (
    <AppMap>
      <ReplayAnimationProvider>
        <ReplayLayer />
        <MainControl title={intl.formatMessage({ id: 'SIDEBAR.MENU.REPLAY' })}>
          <ReplayMainCard />
        </MainControl>
        {hasSelectedTrips && (
          <SubControl>
            <ReplayPlaybackCard />
          </SubControl>
        )}
      </ReplayAnimationProvider>
    </AppMap>
  );
};

export { ReplayMap };
