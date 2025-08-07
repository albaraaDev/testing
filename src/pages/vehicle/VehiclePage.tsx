import { VehicleList } from './blocks';
import UserMiniCards, { MetricData } from '../../components/mini-cards/UserMiniCards.tsx';
import BlocksIcon from '../../assets/svg/BlocksIcon.tsx';
import PeopleIcon from '../../assets/svg/PeopleIcon.tsx';
import { useEffect, useState } from 'react';
import { getVehiclesStats, VehicleStats } from '@/api/cars.ts';
import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';

const VehiclePage = () => {
  const [vehiclesStats, setVehiclesStats] = useState<VehicleStats>({
    total: 0,
    unavailable: 0,
    inMaintenance: 0,
    available: 0
  });

  const handleGetVehiclesStats = async () => {
    try {
      const data = await getVehiclesStats();
      setVehiclesStats(data);
    } catch (error) {
      console.error('Failed to fetch vehicle stats:', error);
    }
  };

  useEffect(() => {
    handleGetVehiclesStats();
  }, []);

  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xl text-gray-800">
          <FormattedMessage id="VEHICLE.LIST.TITLE" />
        </h3>

        <Link to="/vehicles/add-vehicle">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm ml-auto">
            <FormattedMessage id="VEHICLE.LIST.ADD_NEW" />
          </button>
        </Link>
      </div>

      <VehiclesMiniCards stats={vehiclesStats} />
      <VehicleList fetchVehicleStats={handleGetVehiclesStats} />
    </div>
  );
};

type VehiclesMiniCardsProps = {
  stats: VehicleStats;
};

const VehiclesMiniCards = ({ stats }: VehiclesMiniCardsProps) => {
  const intl = useIntl();

  const metrics: MetricData[] = [
    {
      value: stats.total,
      label: intl.formatMessage({ id: 'VEHICLE.STATS.TOTAL' }),
      textColor: 'text-white',
      bgColor: 'bg-blue-500',
      icon: <BlocksIcon />
    },
    {
      value: stats.unavailable,
      label: intl.formatMessage({ id: 'VEHICLE.STATS.UNAVAILABLE' }),
      textColor: 'text-gray-800',
      icon: <PeopleIcon color="#FF0000" />
    },
    {
      value: stats.inMaintenance,
      label: intl.formatMessage({ id: 'VEHICLE.STATS.IN_MAINTENANCE' }),
      textColor: 'text-gray-800',
      icon: <PeopleIcon color="#FFA800" />
    },
    {
      value: stats.available,
      label: intl.formatMessage({ id: 'VEHICLE.STATS.AVAILABLE' }),
      textColor: 'text-gray-800',
      icon: <PeopleIcon color="#5271FF" />
    }
  ];

  return <UserMiniCards metrics={metrics} />;
};

export { VehiclePage };
