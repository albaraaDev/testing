import { getNotifications, NotificationDTO } from '@/api/notifications';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Paginated } from '@/api/common.ts';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import { format } from 'date-fns';
import { CarPlate } from './CarPlate';
import DebouncedSearchInput from '@/components/DebouncedInputField';
import { DefaultNotificationIcon, NotificationsIcon } from '@/assets/svg';
import { NotificationTypeSelect } from '@/pages/reports/components/NotificationTypeSelect';
import clsx from 'clsx';
import { KeenIcon } from '@/components';
import { NOTIFICATION_ICONS } from './NotificationIcons';

const PAGE_SIZE = 10;
const ROW_HEIGHT = 90;

type NotificationsProps = {
  withSearch?: boolean;
  withTypeFilter?: boolean;
  search?: string;
  ident?: string;
  vehicleId?: string;
};

const Notifications = ({
  search: externalSearch,
  withSearch = false,
  withTypeFilter = false,
  ident,
  vehicleId
}: NotificationsProps) => {
  const [notifications, setNotifications] = useState<Paginated<NotificationDTO>>();
  const [searchValue, setSearchValue] = useState<string>(externalSearch || '');
  const [selectedAlarmType, setSelectedAlarmType] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [largestIndex, setLargestIndex] = useState(PAGE_SIZE - 1);
  const { locale } = useIntl();
  const isRowLoaded = ({ index }: { index: number }) => !!notifications?.data[index];

  const rowRenderer = ({
    index,
    key,
    style
  }: {
    index: number;
    key: string;
    style: React.CSSProperties;
  }) => {
    const notification = notifications?.data[index];

    return (
      <div key={key} style={style} className="pe-2">
        <NotificationCard notification={notification} />
      </div>
    );
  };

  const loadMoreRows = async ({
    startIndex,
    stopIndex
  }: {
    startIndex: number;
    stopIndex: number;
  }) => {
    const fetched = await getNotifications({
      offset: {
        start: startIndex,
        end: stopIndex
      },
      search: withSearch ? searchValue : undefined,
      ident,
      vehicleId,
      alarmType: selectedAlarmType
    });

    setNotifications((prev) => {
      const data = prev?.data ?? [];
      fetched?.data.forEach((notification, index) => {
        data[startIndex + index] = notification;
      });
      return {
        data,
        totalCount: fetched.totalCount
      };
    });
    setLargestIndex(Math.max(largestIndex, stopIndex));
  };

  const fetchData = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const data = await getNotifications({
        offset: {
          start: 0,
          end: largestIndex
        },
        search: withSearch ? searchValue : undefined,
        ident,
        vehicleId,
        alarmType: selectedAlarmType
      });
      setNotifications(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebouncedSearch = (value: string) => {
    setSearchValue(value);
    getNotifications({
      offset: {
        start: 0,
        end: PAGE_SIZE - 1
      },
      search: value,
      ident,
      vehicleId,
      alarmType: selectedAlarmType
    }).then(setNotifications);
  };

  const handleAlarmTypeChange = (type: { code: string; label: string } | undefined) => {
    setSelectedAlarmType(type?.code);
    getNotifications({
      offset: {
        start: 0,
        end: PAGE_SIZE - 1
      },
      search: withSearch ? searchValue : undefined,
      ident,
      vehicleId,
      alarmType: type?.code
    }).then(setNotifications);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ident, vehicleId, locale]);

  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== searchValue) {
      setSearchValue(externalSearch);
      // Fetch new notifications when external search changes
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSearch, locale]);

  const remoteRowCount = useMemo(() => notifications?.totalCount ?? 0, [notifications]);
  const viewRowCount = useMemo(() => {
    if (!notifications) {
      return 0;
    }
    return Math.min(notifications.data.length + PAGE_SIZE, remoteRowCount);
  }, [notifications, remoteRowCount]);

  return (
    <div className="card hover:shadow-md h-full">
      <div className="card-header">
        <div className="card-title flex justify-between items-center w-full">
          <h3>
            <FormattedMessage id="DASHBOARD.NOTIFICATIONS.TITLE" />
          </h3>
          <div className="flex items-center gap-3">
            <button
              className="btn btn-light flex items-center justify-center size-10 text-dark rounded-lg"
              onClick={fetchData}
              disabled={isLoading}
            >
              <KeenIcon icon={'arrows-circle'} className={isLoading ? 'animate-spin' : undefined} />
            </button>
            {withTypeFilter && (
              <div className="w-56">
                <NotificationTypeSelect onTypeChange={handleAlarmTypeChange} />
              </div>
            )}
            {withSearch && (
              <div className="w-56">
                <DebouncedSearchInput
                  type="text"
                  className="input"
                  placeholder="Search by ident..."
                  value={searchValue}
                  onDebounce={handleDebouncedSearch}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-2 pt-0" style={{ width: '100%', height: '100%' }}>
        {notifications && notifications.totalCount > 0 ? (
          <AutoSizer>
            {({ width, height }) => (
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={loadMoreRows}
                rowCount={viewRowCount}
              >
                {({ onRowsRendered, registerChild }) => (
                  <List
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(209, 213, 219, 0.8) rgba(209, 213, 219, 0)'
                    }}
                    ref={registerChild}
                    height={height}
                    rowHeight={ROW_HEIGHT}
                    width={width}
                    onRowsRendered={onRowsRendered}
                    rowCount={viewRowCount || 0}
                    rowRenderer={rowRenderer}
                  />
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-gray-500 mb-2">
              <NotificationsIcon />
            </div>
            <h4 className="text-gray-700 font-medium">
              <FormattedMessage
                id="DASHBOARD.NOTIFICATIONS.NO_NOTIFICATIONS"
                defaultMessage="No notifications available"
              />
            </h4>
          </div>
        )}
      </div>
    </div>
  );
};

type NotificationProps = {
  notification?: NotificationDTO;
};

function NotificationCard({ notification }: NotificationProps) {
  if (!notification)
    return (
      <div className="flex flex-col gap-3 mt-3 ps-1 pe-2 h-20">
        <div
          className={clsx('flex gap-4 items-center justify-between w-full', {
            'flex-row-reverse': document.dir === 'rtl',
            'flex-row': document.dir !== 'rtl'
          })}
        >
          <div className="flex gap-2 items-center">
            <div className="size-12 rounded-md bg-slate-200 aspect-square animate-pulse" />
            <div>
              <div className="bg-slate-200 h-4 w-32 rounded-md mb-2 animate-pulse" />
              <div className="bg-slate-200 h-3 w-24 rounded-md mb-2 animate-pulse" />
              <div className="bg-slate-200 h-3 w-48 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col items-end justify-center gap-1">
            <CarPlate />
            <div className="bg-slate-200 h-4 w-20 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="border-t-2 border-dashed" />
      </div>
    );
  return (
    <div className="flex flex-col gap-3 mt-3 ps-1 pe-2 h-20">
      <div
        className={clsx('flex gap-4 items-center justify-between w-full', {
          'flex-row-reverse': document.dir === 'rtl',
          'flex-row': document.dir !== 'rtl'
        })}
      >
        <div
          className={clsx('flex gap-2 items-center', {
            'text-right flex-row-reverse': document.dir === 'rtl',
            'text-left flex-row': document.dir !== 'rtl'
          })}
        >
          <div className="size-12 rounded-md card border-none aspect-square flex items-center justify-center">
            {NOTIFICATION_ICONS[notification.text as keyof typeof NOTIFICATION_ICONS] ?? (
              <DefaultNotificationIcon />
            )}
          </div>
          <div>
            <h4 className="text-gray-800 text-sm font-semibold">{notification.typeTrans}</h4>
            <p className="text-gray-600 mb-0.5 text-[10px] leading-tight font-medium line-clamp-1 text-ellipsis text-pretty">
              {!isNaN(+new Date(+notification.createdAt * 1000)) &&
                format(new Date(+notification.createdAt * 1000), 'yyyy/MM/dd HH:mm:ss')}
            </p>
            <p className="text-gray-600 text-xs font-medium line-clamp-2 text-ellipsis text-pretty">
              {notification.textTrans}
            </p>
          </div>
        </div>
        <div
          className={clsx('flex flex-col justify-center gap-1', {
            'items-start': document.dir === 'rtl',
            'items-end': document.dir !== 'rtl'
          })}
        >
          <CarPlate plate={notification.vehiclePlate} />
          <span className="text-sm font-monospace">{notification.deviceIdent}</span>
        </div>
      </div>
      <div className="border-t-2 border-dashed" />
    </div>
  );
}

export { Notifications };
