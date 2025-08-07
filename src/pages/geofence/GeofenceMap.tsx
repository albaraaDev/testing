import { MainCard } from './blocks/MainCard';
import { MainControl } from '../monitoring/blocks/MainControl';
import { GeofenceLayer } from './blocks/GeofenceLayer';
import AppMap from '@/components/AppMap';
import { Link } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';

const GeofenceMap = () => {
  const intl = useIntl();

  return (
    <AppMap>
      <GeofenceLayer />
      <MainControl
        title={intl.formatMessage({ id: 'SIDEBAR.MENU.GEOFENCE' })}
        bar={
          <Link
            className="btn btn-info btn-clear btn-sm !border-info !border"
            to="/geofences/add"
            onClick={(e) => e.stopPropagation()}
          >
            <FormattedMessage id="SIDEBAR.MENU.GEOFENCE.ADD_GEOFENCE" />
          </Link>
        }
      >
        <MainCard />
      </MainControl>
    </AppMap>
  );
};

export { GeofenceMap };
