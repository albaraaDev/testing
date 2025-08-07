import { DriverStats, getDriversStats } from '@/api/drivers';
import BlocksIcon from '../../assets/svg/BlocksIcon';
import PeopleIcon from '../../assets/svg/PeopleIcon';
import UserMiniCards from '../../components/mini-cards/UserMiniCards';
import { DriverList } from './blocks';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router';

const DriverPage = () => {
  const intl = useIntl();
  const [driversStats, setDriversStats] = useState<DriverStats>();

  const metrics = useMemo(
    () => [
      {
        value: driversStats?.total || 0,
        label: intl.formatMessage({ id: 'DRIVER.STATS.TOTAL' }),
        textColor: 'text-white',
        bgColor: 'bg-blue-500',
        icon: <BlocksIcon />
      },
      {
        value: driversStats?.active || 0,
        label: intl.formatMessage({ id: 'DRIVER.STATS.ACTIVE' }),
        textColor: 'text-gray-800',
        icon: <PeopleIcon color="#5271FF" />
      },
      {
        value: driversStats?.unactive || 0,
        label: intl.formatMessage({ id: 'DRIVER.STATS.UNDER_REVIEW' }),
        textColor: 'text-gray-800',
        icon: <PeopleIcon color="#FFA800" />
      }
    ],
    [driversStats, intl]
  );

  const refetch = () => {
    getDriversStats().then(setDriversStats);
  };

  useEffect(() => {
    refetch();
  }, []);

  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xl text-gray-800">
          <FormattedMessage id="DRIVER.LIST.TITLE" />
        </h3>

        <Link to="/drivers/add-driver">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm ml-auto">
            <FormattedMessage id="DRIVER.LIST.ADD_NEW" />
          </button>
        </Link>
      </div>

      <UserMiniCards metrics={metrics} />
      <DriverList refetch={refetch} />
    </div>
  );
};

export { DriverPage };
