import { Toolbar, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { FormattedMessage, useIntl } from 'react-intl';
import { useState, useMemo, useCallback } from 'react';
import {
  TreeView,
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
import { FetchDataParams, FetchDataResponse } from '@/components/tree-view/types';
import { StatsCards, StatMetricData } from '@/components/stats';
import { KeenIcon } from '@/components/keenicons';
import EditDistributorModal from './blocks/EditDistributorModal';
import ViewDistributorModal from './blocks/ViewDistributorModal';
import { DeviceLinkingModal } from '../blocks/DeviceLinkingModal';
import { deleteUser, UserModel, getDistributors } from '@/api/user';
import { useDebounce } from '@/hooks';
import { DeviceDTO, getDevicesByDistributor } from '@/api/devices';
import { ColumnDef } from '@tanstack/react-table';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import DeviceIcon from '@/pages/device/svg/device.svg?react';
import BlocksIcon from '@/assets/svg/BlocksIcon';
import PeopleIcon from '@/assets/svg/PeopleIcon';
import { toAbsoluteUrl } from '@/utils';
import { enqueueSnackbar } from 'notistack';
import { useDialogs } from '@toolpad/core/useDialogs';
import { DeviceUserModal } from '../blocks/DeviceUserModal';
import { DeviceMutationModal } from '../blocks/DeviceMutationModal';
import { useDistributorStats } from '@/api';

export default function ManageDistributors() {
  const intl = useIntl();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
  const [selectedDistributor, setSelectedDistributor] = useState<UserModel | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [totalDistributors, setTotalDistributors] = useState(0);

  // Fetch distributors data for the new TreeView API
  const fetchDistributorData = useCallback(
    async (params: FetchDataParams): Promise<FetchDataResponse> => {
      const { start, end } = params;

      try {
        const response = await getDistributors({
          start,
          end,
          search: debouncedSearchTerm
        });

        // Update total count
        setTotalDistributors(response.totalCount);

        return {
          items: response.data.map((distributor: UserModel) => ({
            id: distributor.id,
            label: distributor.name,
            hasChildren: false,
            userData: distributor
          })),
          total: response.totalCount
        };
      } catch (error) {
        console.error('Error fetching distributors:', error);
        return { items: [], total: 0 };
      }
    },
    [debouncedSearchTerm]
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showLinkDeviceModal, setShowLinkDeviceModal] = useState(false);
  const [selectedEditDistributor, setSelectedEditDistributor] = useState<UserModel | null>(null);
  const [selectedViewDistributor, setSelectedViewDistributor] = useState<UserModel | null>(null);

  // Function to refresh the TreeView
  const refreshDistributors = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Handler for when the pencil or eye icon is clicked
  const handleIconClick = (type: 'edit' | 'view', item: UserModel) => {
    if (type === 'edit') {
      setSelectedEditDistributor(item);
    }
    if (type === 'view') {
      setSelectedViewDistributor(item);
    }
  };

  // Handler for selecting a distributor in the TreeView
  const handleDistributorSelect = useCallback((item: any) => {
    if (item.userData) {
      setSelectedDistributor(item.userData as UserModel);
    }
  }, []);

  const [deviceDataCount, setDeviceDataCount] = useState<number>(0);
  const [refreshDevices, setRefreshDevices] = useState<number>(0);
  const dialogs = useDialogs();

  // Handler for fetching devices data for DataGrid
  const handleFetchDevicesData = useCallback(
    async (params: TDataGridRequestParams) => {
      if (!selectedDistributor) return Promise.resolve({ data: [], totalCount: 0 });
      const response = await getDevicesByDistributor(selectedDistributor.id, {
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
    [selectedDistributor]
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
                refreshDistributors();
                setRefreshDevices((prev) => prev + 1);
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
    [intl, refreshDistributors]
  );

  // Fetch distributor stats
  const { data: statsData } = useDistributorStats();

  // Create metrics for stats cards
  const metrics = useMemo<StatMetricData[]>(
    () => [
      {
        value: statsData?.total || 0,
        label: intl.formatMessage({
          id: 'DISTRIBUTORS.METRICS.TOTAL',
          defaultMessage: 'Total Distributors'
        }),
        textColor: 'text-white',
        bgColor: 'bg-blue-500',
        icon: <BlocksIcon />
      },
      {
        value: statsData?.active || 0,
        label: intl.formatMessage({
          id: 'DISTRIBUTORS.METRICS.ACTIVE',
          defaultMessage: 'Active Distributors'
        }),
        textColor: 'text-gray-800',
        icon: <PeopleIcon color="#5271FF" />
      },
      {
        value: statsData?.unactive || 0,
        label: intl.formatMessage({
          id: 'DISTRIBUTORS.METRICS.INACTIVE',
          defaultMessage: 'Inactive Distributors'
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
              id="MANAGEMENT.DISTRIBUTORS.TOOLBAR.DESCRIPTION"
              defaultMessage="Manage distributors"
            />
          }
          suffix={
            <button
              type="button"
              className="btn btn-sm btn-info text-white hover:bg-info-active"
              onClick={() => setShowAddModal(true)}
            >
              <i className="ki-solid ki-plus fs-2 me-1"></i>
              <FormattedMessage id="DISTRIBUTORS.ADD" />
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
                <FormattedMessage id="DISTRIBUTORS.LIST" defaultMessage="Distributors" />
                <span className="text-sm text-gray-500 ms-2 select-none">{totalDistributors}</span>
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
                  id: 'DISTRIBUTORS.SEARCH.PLACEHOLDER',
                  defaultMessage: 'Search distributors...'
                })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="card-body p-0" style={{ height: 'calc(100% - 120px)' }}>
            <TreeView
              key={refreshKey}
              fetchData={fetchDistributorData}
              expandable={false}
              suffix={(item, _index) => {
                if (!item.userData) return null;
                const userData = item.userData as UserModel;
                return (
                  <div className="flex items-center justify-center w-14 h-5 text-gray-500 gap-3 me-4">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIconClick('edit', userData);
                      }}
                    >
                      <KeenIcon icon="pencil" className="cursor-pointer hover:text-info" />
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIconClick('view', userData);
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
                              const delRes = await deleteUser(userData.id);
                              enqueueSnackbar(delRes.message, {
                                variant: 'success'
                              });
                              refreshDistributors();
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
              selectedId={selectedDistributor?.id || null}
              onSelect={handleDistributorSelect}
              pageSize={50}
            />
          </div>
        </div>

        {/* Devices DataGrid */}
        <div
          className="col-span-4 card h-[650px]"
          key={selectedDistributor?.id || 'no-distributor'}
        >
          {selectedDistributor ? (
            <>
              <div className="card-header border-b dark:border-gray-700">
                <h3 className="card-title">
                  <FormattedMessage
                    id="MANAGEMENT.DEVICES.TITLE"
                    defaultMessage="Devices for {distributor}"
                    values={{ distributor: selectedDistributor.name }}
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
                      <FormattedMessage id="DISTRIBUTORS.LINK_DEVICES" />
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
                  key={`devices-${selectedDistributor.id}-${refreshDevices}`}
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
                    id="MANAGEMENT.DEVICES.SELECT_DISTRIBUTOR"
                    defaultMessage="Select a distributor to view their devices"
                  />
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Distributor Modal */}
      <EditDistributorModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          refreshDistributors();
          setShowAddModal(false);
        }}
      />

      {/* Edit Distributor Modal */}
      <EditDistributorModal
        open={!!selectedEditDistributor}
        onClose={() => setSelectedEditDistributor(null)}
        onSuccess={() => {
          refreshDistributors();
          setSelectedEditDistributor(null);
        }}
        defaultModel={selectedEditDistributor}
      />

      {/* View Distributor Modal */}
      <ViewDistributorModal
        open={!!selectedViewDistributor}
        onClose={() => setSelectedViewDistributor(null)}
        distributor={selectedViewDistributor}
      />

      {/* Device Linking Modal */}
      {selectedDistributor && (
        <DeviceLinkingModal
          open={showLinkDeviceModal}
          userId={selectedDistributor.id}
          onClose={() => setShowLinkDeviceModal(false)}
          onSuccess={() => {
            refreshDistributors();
            setShowLinkDeviceModal(false);
          }}
          userType="distributor"
        />
      )}
    </>
  );
}
