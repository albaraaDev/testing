import React, { useCallback, useMemo, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import {
  DataGrid,
  KeenIcon,
  Menu,
  MenuIcon,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuToggle,
  TDataGridRequestParams
} from '@/components';
import { ColumnDef } from '@tanstack/react-table';
import { toAbsoluteUrl } from '@/utils';
import DebouncedSearchInput from '@/components/DebouncedInputField';
import { useSnackbar } from 'notistack';
import { useDialogs } from '@toolpad/core/useDialogs';
import { deleteWorkingPeriod, getWorkingPeriods, WorkingPeriodModel } from '@/api/working-hours';
import { EditWorkingHoursModal } from './EditWorkingHoursModal';
import { VehicleLinkingModal } from './VehicleLinkingModal';

interface WorkingHoursListProps {
  refetch: () => void;
}

const WorkingHoursList: React.FC<WorkingHoursListProps> = ({ refetch }) => {
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();
  const intl = useIntl();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVehicleLinkingModalOpen, setIsVehicleLinkingModalOpen] = useState(false);
  const [selectedWorkingPeriod, setSelectedWorkingPeriod] = useState<WorkingPeriodModel | null>(
    null
  );

  const getWorkingPeriodsCB = useCallback(
    async (params: TDataGridRequestParams) => {
      const { pageIndex, pageSize, sorting } = params;

      try {
        const res = await getWorkingPeriods({
          page: pageIndex,
          size: pageSize,
          search: searchQuery,
          sort: sorting?.map((s) => `${s.id}${s.desc ? ',desc' : ',asc'}`).join(',')
        });

        const result = res.result;

        if (res.success === false || !result) {
          enqueueSnackbar(res.message, { variant: 'error' });
          return { data: [], totalCount: 0 };
        }

        return {
          data: result.content,
          totalCount: result.totalElements
        };
      } catch (error) {
        console.error('Error fetching unlinked devices:', error);
        enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), { variant: 'error' });
        return { data: [], totalCount: 0 };
      }
    },
    [enqueueSnackbar, intl, searchQuery]
  );

  const formatDaysOfWeek = useMemo(() => {
    return (days: string[]): string => {
      if (!days || days.length === 0) return '-';

      return days.map((day) => intl.formatMessage({ id: `WORKING_HOURS.DAYS.${day}` })).join(', ');
    };
  }, [intl]);

  const openEditModal = (workingPeriod: WorkingPeriodModel) => {
    setSelectedWorkingPeriod(workingPeriod);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedWorkingPeriod(null);
  };

  const openVehicleLinkingModal = (workingPeriod: WorkingPeriodModel) => {
    setSelectedWorkingPeriod(workingPeriod);
    setIsVehicleLinkingModalOpen(true);
  };

  const closeVehicleLinkingModal = () => {
    setIsVehicleLinkingModalOpen(false);
  };

  const columns = useMemo<ColumnDef<WorkingPeriodModel>[]>(
    () => [
      {
        accessorKey: 'name',
        header: intl.formatMessage({ id: 'WORKING_HOURS.COLUMN.NAME' }),
        enableSorting: true,
        cell: ({ row }) => <span className="text-gray-800 font-bold">{row.original.name}</span>
      },
      {
        accessorKey: 'daysOfWeek',
        header: intl.formatMessage({ id: 'WORKING_HOURS.COLUMN.DAYS' }),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-gray-800">{formatDaysOfWeek(row.original.daysOfWeek)}</span>
        )
      },
      {
        accessorKey: 'startTime',
        header: intl.formatMessage({ id: 'WORKING_HOURS.COLUMN.START_TIME' }),
        enableSorting: true,
        cell: ({ row }) => <span className="text-gray-800">{row.original.startTime}</span>
      },
      {
        accessorKey: 'endTime',
        header: intl.formatMessage({ id: 'WORKING_HOURS.COLUMN.END_TIME' }),
        enableSorting: true,
        cell: ({ row }) => <span className="text-gray-800">{row.original.endTime}</span>
      },
      {
        id: 'actions',
        header: () => intl.formatMessage({ id: 'WORKING_HOURS.COLUMN.ACTIONS' }),
        cell: (info) => (
          <div className="flex gap-3">
            <button
              className="size-7.5 p-2 flex items-center justify-center rounded-full bg-[#50CD89]/10"
              title={intl.formatMessage({ id: 'COMMON.EDIT' })}
              onClick={() => openEditModal(info.row.original)}
            >
              <img src={toAbsoluteUrl('/media/icons/edit-light.svg')} />
            </button>
            <button
              className="size-7.5 p-2 flex items-center justify-center rounded-full bg-[#5151F9]/10"
              title={intl.formatMessage({ id: 'WORKING_HOURS.VEHICLES.MANAGE' })}
              onClick={() => openVehicleLinkingModal(info.row.original)}
            >
              <img src={toAbsoluteUrl('/media/icons/device.svg')} alt="Manage Vehicles" />
            </button>
            <Menu>
              <MenuItem toggle="dropdown" trigger="click">
                <MenuToggle>
                  <KeenIcon className="text-xl" icon="dots-vertical" />
                </MenuToggle>
                <MenuSub className="menu-default">
                  <MenuItem
                    onClick={async () => {
                      if (
                        !(await dialogs.confirm(
                          intl.formatMessage({
                            id: 'WORKING_HOURS.DELETE.MODAL_MESSAGE'
                          }),
                          {
                            title: intl.formatMessage({ id: 'WORKING_HOURS.DELETE.MODAL_TITLE' }),
                            okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
                            cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
                          }
                        ))
                      )
                        return;
                      const delRes = await deleteWorkingPeriod(info.row.original.id);
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
        ),
        meta: {
          className: 'min-w-36'
        }
      }
    ],
    [intl, refetch, dialogs, enqueueSnackbar, formatDaysOfWeek]
  );

  const filters = useMemo(
    () => (searchQuery.trim().length > 2 ? [{ id: '__any', value: searchQuery }] : []),
    [searchQuery]
  );

  const onFetchData = useCallback(
    (params: TDataGridRequestParams) => getWorkingPeriodsCB(params),
    [getWorkingPeriodsCB]
  );

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-semibold text-gray-800">
            <FormattedMessage id="WORKING_HOURS.LIST_TITLE" />
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center ps-3 pointer-events-none">
                <KeenIcon style="duotone" icon="magnifier" />
              </div>
              <DebouncedSearchInput
                type="search"
                className={`w-64 ps-10 pr-4 py-2 input text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-info focus:border-info`}
                placeholder={intl.formatMessage({ id: 'COMMON.SEARCH' })}
                onDebounce={setSearchQuery}
              />
            </div>
          </div>
        </div>
        <div className="working-hours-table">
          <DataGrid
            data={[]}
            columns={columns}
            serverSide={true}
            filters={filters}
            onFetchData={onFetchData}
          />
        </div>
      </div>

      {selectedWorkingPeriod && (
        <>
          <EditWorkingHoursModal
            open={isEditModalOpen}
            workingPeriod={selectedWorkingPeriod}
            onClose={closeEditModal}
            onSuccess={() => {
              refetch();
              closeEditModal();
            }}
          />
          <VehicleLinkingModal
            open={isVehicleLinkingModalOpen}
            workingPeriodId={selectedWorkingPeriod.id}
            onClose={closeVehicleLinkingModal}
            onSuccess={() => {
              refetch();
              closeVehicleLinkingModal();
            }}
          />
        </>
      )}
    </>
  );
};

export { WorkingHoursList };
