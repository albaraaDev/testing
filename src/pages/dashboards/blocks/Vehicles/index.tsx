import { getVehicles, VehicleDetails } from '@/api/cars';
import { Paginated } from '@/api/common';
import { KeenIcon } from '@/components';
import { toAbsoluteUrl } from '@/utils';
import { useEffect, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import VehiclesCardsView from '@/pages/vehicle/components/VehiclesCardsView';

const COLUMN_COUNT = 3;

export function VehicleList() {
  const intl = useIntl();
  const [vehicles, setVehicles] = useState<Paginated<VehicleDetails>>();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getVehicles({ start: 0, end: 20, search: searchQuery }).then(setVehicles);
  }, [searchQuery]);

  return (
    <div className="card">
      <div className="px-7 pt-6 flex items-center justify-between">
        <div className="card-title">
          <h3>
            <FormattedMessage id="DASHBOARD.VEHICLE_LIST.TITLE" defaultMessage="Vehicle" />
          </h3>
          <h4 className="text-sm font-thin text-[#B5B5C3]">
            <FormattedMessage
              id="DASHBOARD.VEHICLE_LIST.SUBTITLE"
              defaultMessage="You have {count, plural, one {vehicle} other {vehicles}}"
              values={{ count: vehicles?.totalCount ?? 0 }}
            />
          </h4>
        </div>
        <div className="flex gap-7 items-center">
          <div className="input max-w-48">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder={intl.formatMessage({ id: 'COMMON.SEARCH', defaultMessage: 'Search' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <a href="/vehicles/add-vehicle">
            <button className="btn btn-info px-4">
              <img src={toAbsoluteUrl('/media/icons/add-user.svg')} />
              <FormattedMessage id="DASHBOARD.VEHICLE_LIST.ADD_CAR" />
            </button>
          </a>
        </div>
      </div>

      <div className="card-body pt-2 px-6 pb-3 [direction:ltr]">
        <VehiclesCardsView searchQuery={searchQuery} columnCount={COLUMN_COUNT} />
      </div>
    </div>
  );
}
