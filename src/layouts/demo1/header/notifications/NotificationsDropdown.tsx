import React, { useEffect, useRef, useState } from 'react';
import { getHeight } from '@/utils';
import { KeenIcon } from '@/components';
import { MenuSub } from '@/components/menu';
import { useViewport } from '@/hooks';
import {
  INotification,
  INotificationsDropdownProps
} from '@/layouts/demo1/header/notifications/types.tsx';
import { Buffer } from 'buffer';
import { useMqttNotifications } from '@/layouts/demo1/header/notifications/useMqttNotifications.tsx';
import { NotificationItem } from '@/layouts/demo1/header/notifications/NotificationItem.tsx';
import { formatTimeAgo } from '@/utils/Date.ts';
import { useSnackbar } from 'notistack';
import { NotificationSnackbar } from '@/layouts/demo1/header/notifications/NotificationSnackbar.tsx';
import { FormattedMessage, useIntl } from 'react-intl';

const NotificationsDropdown = ({ menuItemRef }: INotificationsDropdownProps) => {
  const intl = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const headerRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [scrollableHeight, setScrollableHeight] = useState<number>(0);
  const [viewportHeight] = useViewport();
  const offset = 180;

  useEffect(() => {
    if (notificationsRef.current) {
      let availableHeight: number = viewportHeight - offset;
      if (headerRef.current) availableHeight -= getHeight(headerRef.current);
      if (footerRef.current) availableHeight -= getHeight(footerRef.current);
      setScrollableHeight(availableHeight);
    }
  }, [menuItemRef.current?.isOpen(), viewportHeight]);

  const handleClose = () => {
    if (menuItemRef.current) {
      menuItemRef.current.hide();
    }
  };

  const onMessage = (topic: string, payload: Buffer) => {
    try {
      if (topic.includes('user/notifications')) {
        const parsedNotification: INotification = JSON.parse(payload.toString());
        setNotifications((prevNotifications) => [parsedNotification, ...prevNotifications]);
        showNotificationSnackbar(parsedNotification);
      }
    } catch (error) {
      console.error('Error parsing notification:', error);
    }
  };

  const showNotificationSnackbar = (notification: INotification) => {
    enqueueSnackbar(notification.text, {
      variant: 'default',
      content: (key) => (
        <div key={key} className="p-4">
          <NotificationSnackbar
            plate={notification.vehiclePlate}
            imei={notification.deviceIdent}
            text={notification.textTrans}
            date={formatTimeAgo(notification.createdAt, intl)}
            info={notification.typeTrans}
            type={notification.text}
          />
        </div>
      )
    });
  };

  useMqttNotifications(onMessage);
  const [notifications, setNotifications] = useState<INotification[]>([]);

  return (
    <MenuSub rootClassName="w-full max-w-[420px]" className="light:border-gray-300">
      <div ref={headerRef}>
        <div>
          <div className="flex items-center justify-between gap-2.5 text-sm text-gray-900 font-semibold px-5 py-2.5">
            <FormattedMessage id="DASHBOARD.NOTIFICATIONS.TITLE" />
            <button
              className="btn btn-sm btn-icon btn-light btn-clear shrink-0"
              onClick={handleClose}
            >
              <KeenIcon icon="cross" />
            </button>
          </div>
          <div className="border-b border-b-gray-200"></div>
        </div>
      </div>

      <div
        ref={notificationsRef}
        className="scrollable-y-auto"
        style={{ maxHeight: `${scrollableHeight}px` }}
      >
        <div className="flex flex-col items-center gap-5 py-4 divider-y divider-gray-200">
          {notifications.length == 0 && (
            <span className="text-sm">
              <FormattedMessage id="DASHBOARD.NOTIFICATIONS.NO_NOTIFICATIONS" />
            </span>
          )}
          {notifications.length > 0 &&
            notifications.map((notification, index) => (
              <React.Fragment key={index}>
                <NotificationItem
                  badgeColor="badge-success"
                  plate={notification.vehiclePlate}
                  imei={notification.deviceIdent}
                  text={notification.textTrans}
                  date={formatTimeAgo(notification.createdAt, intl)}
                  info={notification.typeTrans}
                  type={notification.text}
                />
                {index < notifications.length - 1 && (
                  <div className="border-b border-b-gray-200"></div>
                )}
              </React.Fragment>
            ))}
        </div>
      </div>

      {notifications.length > 0 && (
        <div ref={footerRef}>
          <div>
            <div className="border-b border-b-gray-200"></div>
            <div className="flex items-center justify-center my-3">
              <button className="btn btn-sm btn-light justify-center">
                <FormattedMessage id="DASHBOARD.NOTIFICATIONS.MARK_ALL_READ" />
              </button>
            </div>
          </div>
        </div>
      )}
    </MenuSub>
  );
};

export { NotificationsDropdown };
