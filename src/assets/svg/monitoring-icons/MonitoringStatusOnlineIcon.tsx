import React from 'react';

interface MonitoringStatusOnlineIconProps {
  className?: string;
  size?: number;
}

const MonitoringStatusOnlineIcon: React.FC<MonitoringStatusOnlineIconProps> = ({
  className,
  size = 24
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="8" height="8" rx="4" fill="#1BC5BD" />
      <circle cx="4" cy="4" r="2" fill="#E7E8ED" />
    </svg>
  );
};

export default MonitoringStatusOnlineIcon;
