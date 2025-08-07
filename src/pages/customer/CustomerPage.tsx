import { CustomerList } from './blocks/index.ts';
import BlocksIcon from '../../assets/svg/BlocksIcon.tsx';
import PeopleIcon from '../../assets/svg/PeopleIcon.tsx';
import { useEffect, useState } from 'react';
import { getCustomersStats, CustomerStats } from '@/api/customers.ts';
import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import UserMiniCards, { MetricData } from '@/components/mini-cards/UserMiniCards.tsx';

const CustomerPage = () => {
  const [customersStats, setCustomersStats] = useState<CustomerStats>({
    total: 0,
    turkishCount: 0,
    foreignCount: 0,
    companyCount: 0
  });

  const handleGetCustomersStats = async () => {
    try {
      const data = await getCustomersStats();
      setCustomersStats(data);
    } catch (error) {
      console.error('Failed to fetch customer stats:', error);
    }
  };

  useEffect(() => {
    handleGetCustomersStats();
  }, []);

  return (
    <div className="h-full grid gap-5 lg:gap-7.5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xl text-gray-800">
          <FormattedMessage id="CUSTOMER.LIST.TITLE" />
        </h3>

        <Link to="/customers/add-customer">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm ml-auto">
            <FormattedMessage id="CUSTOMER.LIST.ADD_NEW" />
          </button>
        </Link>
      </div>

      <CustomersMiniCards stats={customersStats} />
      <CustomerList fetchCustomerStats={handleGetCustomersStats} />
    </div>
  );
};

type CustomersMiniCardsProps = {
  stats: CustomerStats;
};

const CustomersMiniCards = ({ stats }: CustomersMiniCardsProps) => {
  const intl = useIntl();

  const metrics: MetricData[] = [
    {
      value: stats.total,
      label: intl.formatMessage({ id: 'CUSTOMER.STATS.TOTAL' }),
      textColor: 'text-white',
      bgColor: 'bg-blue-500',
      icon: <BlocksIcon />
    },
    {
      value: stats.turkishCount,
      label: intl.formatMessage({ id: 'CUSTOMER.STATS.TURKISH' }),
      textColor: 'text-gray-800',
      icon: <PeopleIcon color="#FF0000" />
    },
    {
      value: stats.foreignCount,
      label: intl.formatMessage({ id: 'CUSTOMER.STATS.FOREIGN' }),
      textColor: 'text-gray-800',
      icon: <PeopleIcon color="#FFA800" />
    },
    {
      value: stats.companyCount,
      label: intl.formatMessage({ id: 'CUSTOMER.STATS.COMPANY' }),
      textColor: 'text-gray-800',
      icon: <PeopleIcon color="#5271FF" />
    }
  ];

  return <UserMiniCards metrics={metrics} />;
};

export { CustomerPage };
