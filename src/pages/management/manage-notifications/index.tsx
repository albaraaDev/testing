import { Paginated } from '@/api/common';
import {
  getNotificationSettings,
  NotificationSettingsDTO,
  NotificationSettingType,
  updateNotificationSettings
} from '@/api/notifications';
import { Container, DataGrid, TDataGridRequestParams } from '@/components';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/toolbar';
import DebouncedSearchInput from '@/components/DebouncedInputField';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

export default function ManageNotifications() {
  const intl = useIntl();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Paginated<NotificationSettingsDTO>>();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchNotifications = useCallback(
    (
      params = {
        page: 0,
        size: 100,
        sort: 'createdAt,desc',
        search: searchQuery.trim()
      }
    ) => {
      return getNotificationSettings({
        ...params
      }).then((data) => {
        setNotifications(data);
        return data;
      });
    },
    [searchQuery]
  );

  useEffect(() => {
    if (isInitialLoad) {
      fetchNotifications();
      setIsInitialLoad(false);
    }
  }, [fetchNotifications, isInitialLoad]);

  const handleFetchData = useCallback((params: TDataGridRequestParams) => {
    return getNotificationSettings({
      page: params.pageIndex,
      size: params.pageSize,
      sort: params.sorting?.[0]
        ? `${params.sorting[0].id},${params.sorting[0].desc ? 'desc' : 'asc'}`
        : 'id,desc',
      search: params.filters?.find((filter) => filter.id === '__any')?.value as string
    });
  }, []);

  const handleUpdateNotificationSetting = useCallback(
    async (row: NotificationSettingsDTO, field: 'webType' | 'webStatus', value: any) => {
      if (isUpdating) return;

      try {
        setIsUpdating(true);

        let webType = row.webType;
        let webStatus = row.webStatus;

        if (field === 'webType') {
          webType = value as NotificationSettingType;
        } else if (field === 'webStatus') {
          webStatus = value as boolean;
        }

        await updateNotificationSettings({
          notificationTypeId: row.notificationTypeId,
          notificationTypeCode: row.notificationTypeCode,
          userId: row.userId,
          webType,
          webStatus,
          mobileType: row.mobileType,
          mobileStatus: row.mobileStatus
        });

        // Refresh the data
        await fetchNotifications();
      } catch (error) {
        console.error('Failed to update notification settings:', error);
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchNotifications, isUpdating]
  );

  const columns = useMemo<ColumnDef<NotificationSettingsDTO>[]>(
    () => [
      {
        accessorKey: 'notificationTypeTitle',
        header: intl.formatMessage({ id: 'MANAGEMENT.NOTIFICATIONS.COLUMN.NAME' })
      },
      {
        accessorKey: 'webType',
        header: intl.formatMessage({ id: 'MANAGEMENT.NOTIFICATIONS.COLUMN.URGENT' }),
        cell: ({ row }) => {
          const webType: NotificationSettingType = row.getValue('webType');
          return (
            <input
              type="radio"
              className="radio radio-sm checked:!bg-danger checked:!border-danger hover:!border-danger checked:disabled:!border-danger checked:disabled:!bg-danger"
              value={'urgent'}
              checked={webType === 'urgent'}
              onChange={() => handleUpdateNotificationSetting(row.original, 'webType', 'urgent')}
            />
          );
        }
      },
      {
        accessorKey: 'webType',
        header: intl.formatMessage({ id: 'MANAGEMENT.NOTIFICATIONS.COLUMN.IMPORTANT' }),
        cell: ({ row }) => {
          const webType: NotificationSettingType = row.getValue('webType');
          return (
            <input
              type="radio"
              className="radio radio-sm checked:!bg-warning checked:!border-warning hover:!border-warning checked:disabled:!border-warning checked:disabled:!bg-warning"
              value={'important'}
              checked={webType === 'important'}
              onChange={() => handleUpdateNotificationSetting(row.original, 'webType', 'important')}
            />
          );
        }
      },
      {
        accessorKey: 'webType',
        header: intl.formatMessage({ id: 'MANAGEMENT.NOTIFICATIONS.COLUMN.NORMAL' }),
        cell: ({ row }) => {
          const webType: NotificationSettingType = row.getValue('webType');
          return (
            <input
              type="radio"
              className="radio radio-sm checked:!bg-success checked:!border-success hover:!border-success checked:disabled:!border-success checked:disabled:!bg-success"
              value={'normal'}
              checked={webType === 'normal'}
              onChange={() => handleUpdateNotificationSetting(row.original, 'webType', 'normal')}
            />
          );
        }
      },
      {
        accessorKey: 'webStatus',
        header: intl.formatMessage({ id: 'MANAGEMENT.NOTIFICATIONS.COLUMN.STATUS' }),
        cell: ({ row }) => {
          const webStatus: boolean = row.getValue('webStatus');
          return (
            <div className="switch switch-lg">
              <input
                type="checkbox"
                className="switch switch-lg switch-info checked:!bg-info checked:!border-info hover:!border-info checked:disabled:!border-info checked:disabled:!bg-info !opacity-100"
                checked={webStatus}
                onChange={() =>
                  handleUpdateNotificationSetting(row.original, 'webStatus', !webStatus)
                }
              />
            </div>
          );
        }
      }
    ],
    [intl, handleUpdateNotificationSetting, isUpdating]
  );

  return (
    <Container>
      <Toolbar>
        <ToolbarHeading title={<FormattedMessage id="SIDEBAR.MENU.MANAGEMENT.NOTIFICATIONS" />} />
      </Toolbar>

      <div className="card">
        <div className="flex justify-between items-center p-4">
          <h2 className="font-semibold">
            <FormattedMessage
              id="MANAGEMENT.NOTIFICATIONS.NOTIFICATION_COUNT"
              values={{ count: notifications?.totalCount ?? 0 }}
            />
          </h2>
          <DebouncedSearchInput
            onDebounce={setSearchQuery}
            placeholder={intl.formatMessage({ id: 'COMMON.SEARCH' })}
            className="w-64 py-2 text-sm border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-info focus:border-info input"
          />
        </div>

        <div className="report-table-container">
          <DataGrid
            columns={columns}
            serverSide={true}
            onFetchData={handleFetchData}
            pagination={{ size: 100, sizes: undefined }}
            filters={[
              ...(searchQuery.trim().length > 2 ? [{ id: '__any', value: searchQuery }] : [])
            ]}
          />
        </div>
      </div>
    </Container>
  );
}
