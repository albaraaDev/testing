import React from 'react';
import clsx from 'clsx';

export interface StatMetricData {
  value: string | number;
  label: string;
  textColor: string;
  bgColor?: string;
  icon?: React.ReactNode;
}

export interface StatsCardsProps {
  metrics: StatMetricData[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ metrics }) => {
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

interface MetricCardProps {
  classNames?: {
    root?: string;
    icon?: string;
    label?: string;
    value?: string;
  };
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const MetricCard: React.FC<MetricCardProps> = ({ classNames, icon, label, value }) => {
  return (
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
};

export { StatsCards };
