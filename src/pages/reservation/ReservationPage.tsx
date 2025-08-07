import { ReservationList } from './blocks/index.ts';
import BlocksIcon from '../../assets/svg/BlocksIcon.tsx';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import UserMiniCards, { MetricData } from '@/components/mini-cards/UserMiniCards.tsx';
import {
  getReservationsStats,
  ReservationStats,
  reservationStatusKey
} from '@/api/reservations.ts';
import RentIcon from '@/assets/svg/RentIcon.tsx';

const ReservationPage = () => {
  const [reservationsStats, setReservationsStats] = useState<ReservationStats>({
    total: 0,
    unconfirmed: 0,
    confirmed: 0,
    inprogress: 0,
    canceled: 0,
    completed: 0
  });

  const handleGetReservationsStats = async () => {
    try {
      const data = await getReservationsStats();
      setReservationsStats(data);
    } catch (error) {
      console.error('Failed to fetch reservation stats:', error);
    }
  };

  useEffect(() => {
    handleGetReservationsStats();
  }, []);

  return (
    <div className="h-full grid gap-5 lg:gap-7.5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xl text-gray-800">
          <FormattedMessage id="RESERVATION.LIST.TITLE" />
        </h3>

        <Link to="/reservations/add-reservation">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm ml-auto">
            <FormattedMessage id="RESERVATION.LIST.ADD_NEW" />
          </button>
        </Link>
      </div>

      <ReservationsMiniCards stats={reservationsStats} />
      <ReservationList fetchReservationStats={handleGetReservationsStats} />
    </div>
  );
};

type ReservationsMiniCardsProps = {
  stats: ReservationStats;
};

const ReservationsMiniCards = ({ stats }: ReservationsMiniCardsProps) => {
  const intl = useIntl();

  const metrics: MetricData[] = [
    {
      value: stats.total,
      label: intl.formatMessage({ id: 'RESERVATIONS.RESERVATION_STATUS.TOTAL' }),
      textColor: 'text-white',
      bgColor: 'bg-blue-500',
      icon: <BlocksIcon />
    },
    {
      value: stats.unconfirmed,
      label: intl.formatMessage({ id: reservationStatusKey('UNCONFIRMED') }),
      textColor: 'text-gray-800',
      icon: <RentIcon color="#FFA800" />
    },
    {
      value: stats.confirmed,
      label: intl.formatMessage({ id: reservationStatusKey('CONFIRMED') }),
      textColor: 'text-gray-800',
      icon: <RentIcon color="#FFA800" />
    },
    {
      value: stats.inprogress,
      label: intl.formatMessage({ id: reservationStatusKey('INPROGRESS') }),
      textColor: 'text-gray-800',
      icon: <RentIcon color="#FFA800" />
    },

    {
      value: stats.canceled,
      label: intl.formatMessage({ id: reservationStatusKey('CANCELED') }),
      textColor: 'text-gray-800',
      icon: <RentIcon color="#FF0000" />
    },
    {
      value: stats.completed,
      label: intl.formatMessage({ id: reservationStatusKey('COMPLETED') }),
      textColor: 'text-gray-800',
      icon: <RentIcon color="#5271FF" />
    }
  ];

  return <UserMiniCards metrics={metrics} />;
};

export { ReservationPage };
