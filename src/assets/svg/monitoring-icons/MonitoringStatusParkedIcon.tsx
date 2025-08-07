import React from 'react';

interface MonitoringStatusParkedIconProps {
  className?: string;
  size?: number;
  fill?: string;
}

const MonitoringStatusParkedIcon: React.FC<MonitoringStatusParkedIconProps> = ({
  className,
  size = 24,
  fill = '#FFA800'
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5 0C2.25371 0 0 2.25371 0 5C0 7.74629 2.25371 10 5 10C7.74629 10 10 7.74629 10 5C10 2.25371 7.74629 0 5 0ZM5.58594 5.87891H4.12109V8.22266H2.94922V1.77734H5.58594C6.7168 1.77734 7.63672 2.69727 7.63672 3.82812C7.63672 4.95898 6.7168 5.87891 5.58594 5.87891Z"
        fill={fill}
      />
    </svg>
  );
};

export default MonitoringStatusParkedIcon;
