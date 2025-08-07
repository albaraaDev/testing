import { Toolbar, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { FormattedMessage, useIntl } from 'react-intl';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  TreeView,
  TreeItem,
  DataGrid,
  TDataGridRequestParams,
  Menu,
  MenuItem,
  MenuToggle,
  MenuSub,
  MenuLink,
  MenuIcon,
  MenuTitle
} from '@/components';
import { StatsCards, StatMetricData } from '@/components/stats';
import { KeenIcon } from '@/components/keenicons';
import EditUserModal from './blocks/EditUserModal';
import ViewUserModal from './blocks/ViewUserModal';
import { DeviceLinkingModal } from '../blocks/DeviceLinkingModal';
import { deleteUser, getParentPath, getUsers, getUsersByParentId, UserModel } from '@/api/user';
import { useDebounce } from '@/hooks';
import { DeviceDTO, getLinkedDevicesByUser } from '@/api/devices';
import { ColumnDef } from '@tanstack/react-table';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import DeviceIcon from '@/pages/device/svg/device.svg?react';
import BlocksIcon from '@/assets/svg/BlocksIcon';
import PeopleIcon from '@/assets/svg/PeopleIcon';
import { toAbsoluteUrl } from '@/utils';
import { enqueueSnackbar } from 'notistack';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useUserStats } from '@/api/hooks/userStatsHooks';
import { DeviceUserModal } from '../blocks/DeviceUserModal';
import { DeviceMutationModal } from '../blocks/DeviceMutationModal';
import { FetchDataParams, FetchDataResponse } from '@/components/tree-view/types';

export default function ManageUsers() {
  const intl = useIntl();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLinkDeviceModal, setShowLinkDeviceModal] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState<UserModel | null>(null);
  const [selectedViewUser, setSelectedViewUser] = useState<UserModel | null>(null);

  // Keep track of all loaded users for the suffix function
  const [allUsers, setAllUsers] = useState<UserModel[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [preExpandedIds, setPreExpandedIds] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Single fetch function for both root and children with pagination
  const fetchUserData = useCallback(
    async (params: FetchDataParams): Promise<FetchDataResponse> => {
      const { itemId, start, end } = params;

      try {
        let response;
        if (itemId) {
          // Fetch children for a specific user
          response = await getUsersByParentId({ start, end }, itemId);
        } else {
          // Fetch root users
          response = await getUsers({ start, end, search: debouncedSearchTerm });
        }

        // Update the allUsers state to keep track of loaded users
        setAllUsers((prev) => {
          const existingIds = new Set(prev.map((u) => u.id));
          const newUsers = response.data.filter((u) => !existingIds.has(u.id));
          return [...prev, ...newUsers];
        });

        // Update total count for root users
        if (!itemId) {
          setTotalUsers(response.totalCount);
        }

        return {
          items: response.data.map((user: UserModel) => ({
            id: user.id,
            label: user.name,
            hasChildren: true,
            parentId: itemId,
            userData: user
          })),
          total: response.totalCount
        };
      } catch (error) {
        console.error(`Error fetching users for ${itemId || 'root'}:`, error);
        return { items: [], total: 0 };
      }
    },
    [debouncedSearchTerm]
  );

  const fetchAndExpandParentPath = useCallback(async (userId: string) => {
    try {
      const parentPath = await getParentPath(userId);
      setPreExpandedIds(parentPath);
    } catch (error) {
      console.error('Error fetching parent path:', error);
    }
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchAndExpandParentPath(selectedUser.id);
    }
  }, [selectedUser, fetchAndExpandParentPath]);

  const refetch = useCallback(() => {
    // Clear the users cache and trigger TreeView refresh
    setAllUsers([]);
    setTotalUsers(0);
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Handler for when the pencil or eye icon is clicked
  const handleIconClick = (type: 'edit' | 'view', item: UserModel) => {
    if (type === 'edit') {
      setSelectedEditUser(item);
    }
    if (type === 'view') {
      setSelectedViewUser(item);
    }
  };

  // Handler for selecting a user in the TreeView
  const handleUserSelect = useCallback((item: TreeItem) => {
    if (item.userData) {
      setSelectedUser(item.userData as UserModel);
    }
  }, []);

  const [deviceDataCount, setDeviceDataCount] = useState<number>(0);
  const dialogs = useDialogs();

  // Handler for fetching devices data for DataGrid
  const handleFetchDevicesData = useCallback(
    async (params: TDataGridRequestParams) => {
      if (!selectedUser) return Promise.resolve({ data: [], totalCount: 0 });
      const response = await getLinkedDevicesByUser(selectedUser.id, {
        page: params.pageIndex || 0,
        size: params.pageSize || 10,
        sort: params.sorting?.[0]
          ? `${params.sorting[0].id},${params.sorting[0].desc ? 'desc' : 'asc'}`
          : 'subscriptionStartDate,desc',
        search: (params.filters?.find((f) => f.id === '__any')?.value as string) || ''
      });

      const res = response.result;

      const retData = {
        data: res.content,
        totalCount: res.totalElements
      };
      setDeviceDataCount(res.totalElements);

      return retData;
    },
    [selectedUser]
  );

  // Columns for the devices DataGrid
  const deviceColumns = useMemo<ColumnDef<DeviceDTO>[]>(
    () => [
      {
        accessorKey: 'ident',
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.IDENTIFY_NUMBER' })
      },
      {
        accessorKey: 'phone',
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.PHONE' })
      },
      {
        accessorKey: 'vehiclePlate',
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.PLATE' }),
        cell: ({ row }) => <CarPlate plate={row.original.vehiclePlate} />
      },
      {
        accessorKey: 'status',
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.STATUS' })
      },
      {
        accessorKey: 'installationStatus',
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.INSTALLATION_STATUS' }),
        cell: ({ row }) => (row.original.installationStatus ? row.original.installationStatus : '-')
      },
      {
        accessorKey: 'installationDate',
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.INSTALLATION_DATE' }),
        cell: ({ row }) => (row.original.installationDate ? row.original.installationDate : '-')
      },
      {
        accessorKey: 'currentMileage',
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.ODOMETER' }),
        cell: ({ row }) => (row.original.currentMileage ? row.original.currentMileage : '-')
      },
      {
        accessorKey: 'subscriptionStartDate',
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.START_DATE' })
      },
      {
        accessorKey: 'subscriptionEndDate',
        header: intl.formatMessage({ id: 'MANAGEMENT.DEVICES.COLUMN.END_DATE' })
      },
      {
        header: intl.formatMessage({ id: 'COMMON.ACTIONS' }),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <DeviceUserModal deviceIdent={row.original.ident} userId={row.original.userId} />
            <DeviceMutationModal
              device={row.original}
              onSuccess={() => {
                refetch();
              }}
              renderActionButton={(open) => (
                <button
                  type="button"
                  className="p-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#50CD89]/10"
                  title={intl.formatMessage({ id: 'COMMON.EDIT' })}
                  onClick={open}
                >
                  <img
                    src={toAbsoluteUrl('/media/icons/edit-light.svg')}
                    alt={intl.formatMessage({ id: 'COMMON.EDIT' })}
                  />
                </button>
              )}
            />
          </div>
        )
      }
    ],
    [intl, refetch]
  );

  // Fetch user stats
  const { data: statsData } = useUserStats();

  // Create metrics for stats cards
  const metrics = useMemo<StatMetricData[]>(
    () => [
      {
        value: statsData?.total || 0,
        label: intl.formatMessage({
          id: 'USERS.METRICS.TOTAL',
          defaultMessage: 'Total Users'
        }),
        textColor: 'text-white',
        bgColor: 'bg-blue-500',
        icon: <BlocksIcon />
      },
      {
        value: statsData?.active || 0,
        label: intl.formatMessage({
          id: 'USERS.METRICS.ACTIVE',
          defaultMessage: 'Active Users'
        }),
        textColor: 'text-gray-800',
        icon: <PeopleIcon color="#5271FF" />
      },
      {
        value: statsData?.unactive || 0,
        label: intl.formatMessage({
          id: 'USERS.METRICS.INACTIVE',
          defaultMessage: 'Inactive Users'
        }),
        textColor: 'text-gray-800',
        icon: <PeopleIcon color="#FFA800" />
      }
    ],
    [intl, statsData?.active, statsData?.total, statsData?.unactive]
  );

  return (
    <>
      <Toolbar>
        <ToolbarHeading
          title={<FormattedMessage id="SIDEBAR.MENU.MANAGEMENT" />}
          description={
            <FormattedMessage
              id="MANAGEMENT.USERS.TOOLBAR.DESCRIPTION"
              defaultMessage="Manage users"
            />
          }
          suffix={
            <button
              type="button"
              className="btn btn-sm btn-info text-white hover:bg-info-active"
              onClick={() => setShowAddModal(true)}
            >
              <i className="ki-solid ki-plus fs-2 me-1"></i>
              <FormattedMessage id="USERS.ADD" />
            </button>
          }
        />
      </Toolbar>

      <StatsCards metrics={metrics} />

      <div className="grid grid-cols-5 gap-4 mt-5">
        <div className="col-span-1 card h-[650px] overflow-hidden">
          <div className="card-header border-b dark:border-gray-700">
            <h3 className="card-title w-full">
              <div className="flex items-center">
                <FormattedMessage id="USERS.LIST" defaultMessage="Users" />
                <span className="text-sm text-gray-500 ms-2 select-none">{totalUsers}</span>
              </div>
            </h3>
          </div>
          <div className="card-toolbar px-4 py-3 w-full">
            <div className="flex items-center position-relative w-full">
              <span className="position-absolute start-0 top-0 h-100 w-9 d-flex align-items-center justify-content-center">
                <KeenIcon icon="magnifier" className="fs-4 text-gray-500" />
              </span>
              <input
                type="text"
                className="form-control h-12 ps-4 w-full border rounded-md select-none hover:bg-gray-100 dark:hover:bg-gray-100/5 dark:bg-transparent dark:text-gray-800 dark:border-gray-300 dark:placeholder-gray-500 focus:outline-gray-300 focus:border-gray-300 dark:focus:border-gray-500"
                placeholder={intl.formatMessage({
                  id: 'USERS.SEARCH.PLACEHOLDER',
                  defaultMessage: 'Search users...'
                })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="card-body p-0" style={{ height: 'calc(100% - 120px)' }}>
            <TreeView
              key={`tree-${refreshKey}-${debouncedSearchTerm}`}
              fetchData={fetchUserData}
              noChildrenMessage={intl.formatMessage({
                id: 'USER.NO_CHILDREN',
                defaultMessage: 'No users under this item'
              })}
              onSelect={handleUserSelect}
              preExpandedIds={preExpandedIds}
              selectedId={selectedUser?.id || null}
              pageSize={50}
              suffix={(itm, _) => {
                var item = allUsers.find((u) => u.id === itm.id);
                if (!item) return null;
                return (
                  <div className="flex items-center justify-center w-14 h-5 text-gray-500 gap-3 me-4">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIconClick('edit', item!);
                      }}
                    >
                      <KeenIcon icon="pencil" className="cursor-pointer hover:text-info" />
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIconClick('view', item!);
                      }}
                    >
                      <KeenIcon
                        icon="eye"
                        style="outline"
                        className="cursor-pointer hover:text-info"
                      />
                    </div>
                    <Menu>
                      <MenuItem toggle="dropdown" trigger="click">
                        <MenuToggle>
                          <KeenIcon
                            className="cursor-pointer hover:text-info"
                            icon="dots-vertical"
                          />
                        </MenuToggle>
                        <MenuSub className="menu-default">
                          <MenuItem
                            onClick={async () => {
                              if (
                                !(await dialogs.confirm(
                                  intl.formatMessage({
                                    id: 'USER.DELETE.MODAL_MESSAGE'
                                  }),
                                  {
                                    title: intl.formatMessage({ id: 'USER.DELETE.MODAL_TITLE' }),
                                    okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
                                    cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
                                  }
                                ))
                              )
                                return;
                              const delRes = await deleteUser(item!.id);
                              enqueueSnackbar(delRes.message, {
                                variant: 'success'
                              });
                              refetch();
                            }}
                          >
                            <MenuLink>
                              <MenuIcon>
                                <img src={toAbsoluteUrl('/media/icons/delete-light.svg')} />
                              </MenuIcon>
                              <MenuTitle>
                                <FormattedMessage id="COMMON.DELETE" />
                              </MenuTitle>
                            </MenuLink>
                          </MenuItem>
                        </MenuSub>
                      </MenuItem>
                    </Menu>
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* Devices DataGrid */}
        <div className="col-span-4 card h-[650px]" key={selectedUser?.id || 'no-user'}>
          {selectedUser ? (
            <>
              <div className="card-header border-b dark:border-gray-700">
                <h3 className="card-title">
                  <FormattedMessage
                    id="MANAGEMENT.DEVICES.TITLE"
                    defaultMessage="Devices for {user}"
                    values={{ user: selectedUser.name }}
                  />
                </h3>
              </div>
              <div className="card-toolbar px-4 py-3 w-full">
                <div className="flex items-center position-relative w-full justify-between">
                  <div className="flex items-center gap-3">
                    <span className="position-absolute start-0 top-0 h-100 w-9 d-flex align-items-center justify-content-center">
                      <KeenIcon icon="magnifier" className="fs-4 text-gray-500" />
                    </span>
                    <div className="w-64">
                      <input
                        type="text"
                        className="form-control h-12 ps-4 w-full border rounded-md select-none hover:bg-gray-100 dark:hover:bg-gray-100/5 dark:bg-transparent dark:text-gray-800 dark:border-gray-300 dark:placeholder-gray-500 focus:outline-gray-300 focus:border-gray-300 dark:focus:border-gray-500"
                        placeholder={intl.formatMessage({
                          id: 'DEVICES.SEARCH.PLACEHOLDER',
                          defaultMessage: 'Search devices...'
                        })}
                        value={deviceSearchTerm}
                        onChange={(e) => setDeviceSearchTerm(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-info text-white hover:bg-info-active"
                      onClick={() => setShowLinkDeviceModal(true)}
                    >
                      <DeviceIcon className="size-4 min-w-4 text-white" />
                      <FormattedMessage id="USERS.LINK_DEVICES" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="mt-2 text-sm text-gray-500">
                      <FormattedMessage
                        id="MANAGEMENT.DEVICES.DEVICE_COUNT"
                        defaultMessage="{count, plural, zero {no devices} one {one device} other {# devices}}"
                        values={{ count: deviceDataCount }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="card-body p-0 report-table-container"
                style={{ height: 'calc(100% - 120px)' }}
              >
                <DataGrid
                  columns={deviceColumns}
                  onFetchData={handleFetchDevicesData}
                  serverSide={true}
                  pagination={{ size: 10 }}
                  filters={
                    deviceSearchTerm.length > 2 ? [{ id: '__any', value: deviceSearchTerm }] : []
                  }
                />
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full">
              <div className="text-center text-gray-500">
                <KeenIcon icon="arrow-left" className="fs-2x mb-3" />
                <p className="text-lg">
                  <FormattedMessage
                    id="MANAGEMENT.DEVICES.SELECT_USER"
                    defaultMessage="Select a user to view their devices"
                  />
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <EditUserModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          refetch();
          setShowAddModal(false);
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        open={!!selectedEditUser}
        onClose={() => setSelectedEditUser(null)}
        onSuccess={() => {
          refetch();
          setSelectedEditUser(null);
        }}
        defaultModel={selectedEditUser}
      />

      {/* View User Modal */}
      <ViewUserModal
        open={!!selectedViewUser}
        onClose={() => setSelectedViewUser(null)}
        user={selectedViewUser}
      />

      {/* Device Linking Modal */}
      {selectedUser && (
        <DeviceLinkingModal
          open={showLinkDeviceModal}
          userId={selectedUser.id}
          onClose={() => setShowLinkDeviceModal(false)}
          onSuccess={() => {
            refetch();
            setShowLinkDeviceModal(false);
          }}
          userType="user"
        />
      )}
    </>
  );
}
