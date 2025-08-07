import { useEffect, useMemo, useState } from 'react';
import UserMiniCards from '../../components/mini-cards/UserMiniCards';
import { DeviceList } from './blocks';
import BlocksIcon from '../../assets/svg/BlocksIcon';
import { DeviceStats, getDevicesStats } from '@/api/devices';
import DeviceIcon from './svg/device.svg?react';
import RoleComponent from '@/components/RoleComponent';
import { FormattedMessage, useIntl } from 'react-intl';

const DevicePage = () => {
  const [deviceStats, setDeviceStats] = useState<DeviceStats>();
  const intl = useIntl();

  const metrics = useMemo(
    () => [
      {
        value: deviceStats?.total || 0,
        label: intl.formatMessage({ id: 'DEVICE.STATS.TOTAL' }),
        textColor: 'text-white',
        bgColor: 'bg-blue-500',
        icon: <BlocksIcon />
      },
      {
        value: deviceStats?.online || 0,
        label: intl.formatMessage({ id: 'DEVICE.STATS.ONLINE' }),
        textColor: 'text-gray-800',
        icon: <DeviceIcon className="text-teal-500" />
      },
      {
        value: deviceStats?.offline || 0,
        label: intl.formatMessage({ id: 'DEVICE.STATS.OFFLINE' }),
        textColor: 'text-gray-800',
        icon: <DeviceIcon className="text-red-500" />
      },
      {
        value: deviceStats?.connected || 0,
        label: intl.formatMessage({ id: 'DEVICE.STATS.CONNECTED' }),
        textColor: 'text-gray-800',
        icon: <DeviceIcon className="text-orange-500" />
      },
      {
        value: deviceStats?.disconnected || 0,
        label: intl.formatMessage({ id: 'DEVICE.STATS.DISCONNECTED' }),
        textColor: 'text-gray-800',
        icon: <DeviceIcon className="text-violet-500" />
      }
    ],
    [deviceStats, intl]
  );

  const refetch = () => {
    getDevicesStats().then(setDeviceStats);
  };

  useEffect(() => {
    refetch();
  }, []);

  return (
    <div className="flex flex-col gap-5 lg:gap-7.5 h-full">
      <div className="grid gap-5 lg:gap-7.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-gray-800">
            <FormattedMessage id="DEVICE.TITLE" />
          </h3>

          <RoleComponent role={['ADMIN', 'SUPER_ADMIN', 'MANAGER']}>
            <a href="/devices/add-device">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm ml-auto">
                <FormattedMessage id="DEVICE.ADD_NEW" />
              </button>
            </a>
          </RoleComponent>
        </div>
      </div>

      <UserMiniCards metrics={metrics} />
      <DeviceList refetchStats={refetch} />
    </div>
  );
};

export { DevicePage };
