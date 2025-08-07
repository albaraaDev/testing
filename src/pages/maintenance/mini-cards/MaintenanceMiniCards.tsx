import React, { useMemo } from 'react';
import clsx from 'clsx';
import { IMaintenanceCardProps, IMaintenanceStats } from '@/api/maintenance.ts';
import BlocksIcon from '@/assets/svg/BlocksIcon';
import { MaintenanceIcon } from '@/assets/svg';
import { useIntl } from 'react-intl';

const MaintenanceMiniCards = (props: { stats: IMaintenanceStats | undefined }) => {
  const intl = useIntl();

  const metrics = useMemo(
    () => [
      {
        value: props?.stats?.total || 0,
        label: intl.formatMessage({ id: 'MAINTENANCE.STATS.TOTAL' }),
        textColor: 'text-white',
        bgColor: 'bg-blue-500',
        icon: <BlocksIcon />
      },
      {
        value: props?.stats?.lastMonth || 0,
        label: intl.formatMessage({ id: 'MAINTENANCE.STATS.LAST_MONTH' }),
        textColor: 'text-gray-800',
        icon: <MaintenanceIcon color="#FFA800" />
      },
      {
        value: props?.stats?.ongoing || 0,
        label: intl.formatMessage({ id: 'MAINTENANCE.STATS.ONGOING' }),
        textColor: 'text-gray-800',
        icon: <MaintenanceIcon color="#FF0000" />
      },
      {
        value: props?.stats?.finished || 0,
        label: intl.formatMessage({ id: 'MAINTENANCE.STATS.FINISHED' }),
        textColor: 'text-gray-800',
        iconColor: 'bg-blue-500',
        icon: <MaintenanceIcon color="#50C878" />
      }
    ],
    [props, intl]
  );

  const MetricCard: React.FC<IMaintenanceCardProps> = ({ classNames, icon, label, value }) => (
    <div
      className={clsx(
        'card rounded-lg flex flex-col items-start hover:shadow-lg w-full md:flex-1',
        classNames?.root
      )}
    >
      <div className="flex gap-2 items-center">
        <div className={clsx('p-4 pb-2', classNames?.icon)}>{icon}</div>
        <p className={clsx('text-2xl font-semibold mt-1', classNames?.value)}>{value}</p>
      </div>
      <div className="p-6 py-4 relative">
        <div className="flex items-center justify-between">
          <p className={clsx('text-sm', classNames?.label)}>{label}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-wrap gap-4 w-full">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          classNames={{
            root: metric.bgColor,
            icon: metric.textColor,
            label: metric.textColor,
            value: metric.textColor
          }}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
        />
      ))}
    </div>
  );
};

export { MaintenanceMiniCards };
