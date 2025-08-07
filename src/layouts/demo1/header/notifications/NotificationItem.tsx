import { INotificationItemProps } from '@/layouts/demo1/header/notifications/types.tsx';
import { FormattedMessage } from 'react-intl';
import { DefaultNotificationIcon } from '@/assets/svg';
import { NOTIFICATION_ICONS } from '@/pages/dashboards/blocks/NotificationIcons';

const NotificationItem = ({ imei, plate, text, date, info, type }: INotificationItemProps) => {
  return (
    <div className="flex grow gap-6 px-5 w-full">
      <div className="flex justify-center items-center size-14 bg-gray-200 rounded-full">
        {NOTIFICATION_ICONS[type as keyof typeof NOTIFICATION_ICONS] ?? <DefaultNotificationIcon />}
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-gray-900 text-2sm mb-px">
          <FormattedMessage id="NOTIFICATIONS.VEHICLE_PLATE" values={{ plate }} />
        </div>
        <div className="text-gray-900 text-2sm mb-px">
          <FormattedMessage id="NOTIFICATIONS.DEVICE_IMEI" values={{ imei }} />
        </div>
        <span className="text-2sm text-gray-700">
          <FormattedMessage id="NOTIFICATIONS.MESSAGE" values={{ text }} />
        </span>
        <span className="flex items-center text-2xs font-medium text-gray-500">
          <FormattedMessage id="NOTIFICATIONS.DATE" values={{ date }} />
          <span className="badge badge-circle bg-gray-500 size-1 mx-1.5"></span>
          <FormattedMessage id="NOTIFICATIONS.TYPE" values={{ info }} />
        </span>
      </div>
    </div>
  );
};

export { NotificationItem };
