import { Paginated } from '@/api/common';
import { useEffect, useState } from 'react';
import { toAbsoluteUrl } from '@/utils';
import { DriverDetails, getDrivers } from '@/api/drivers';
import { KeenIcon } from '@/components';
import { FormattedMessage, useIntl } from 'react-intl';
import DriversCardView from '@/pages/driver/blocks/DriversCardView';

const COLUMN_COUNT = 3;

const DriverList = () => {
  const intl = useIntl();
  const [drivers, setDrivers] = useState<Paginated<DriverDetails>>();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getDrivers({ start: 0, end: 10, search: searchQuery }).then(setDrivers);
  }, [searchQuery]);

  return (
    <div className="card">
      <div className="px-7 pt-6 flex items-center justify-between">
        <div className="card-title">
          <h3>
            <FormattedMessage id="DRIVER.TITLE" defaultMessage="Driver" />
          </h3>
          <h4 className="text-sm font-thin text-[#B5B5C3]">
            <FormattedMessage
              id="DRIVER.SUBTITLE"
              defaultMessage="You have {count} {count, plural, one {customer} other {customers}}"
              values={{ count: drivers?.totalCount ?? 0 }}
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
          <a href="/drivers/add-driver">
            <button className="btn btn-info px-4">
              <img src={toAbsoluteUrl('/media/icons/add-user.svg')} />
              <FormattedMessage id="DRIVER.ADD" defaultMessage="Add Driver" />
            </button>
          </a>
        </div>
      </div>

      <div className="card-body pt-2 px-6 pb-3">
        <DriversCardView searchQuery={searchQuery} columnCount={COLUMN_COUNT} />
      </div>
    </div>
  );
};

export { DriverList };
