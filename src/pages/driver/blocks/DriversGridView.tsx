import React, { useCallback, useMemo } from 'react';
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
  useDataGrid
} from '@/components';
import { getDrivers, DriverDetails, updateDriverStatus, deleteDriver } from '@/api/drivers';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { toAbsoluteUrl } from '@/utils';
import { CarView } from '@/pages/vehicle/blocks/CarView';
import { StatusDropdown } from '@/pages/dashboards/blocks/StatusDropdown';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDialogs } from '@toolpad/core/useDialogs';
import { Link } from 'react-router';

const DriverListDropdown = (
  info: CellContext<DriverDetails, unknown> & { refetch: () => void }
) => {
  const intl = useIntl();
  const reload = useDataGrid().fetchServerSideData;
  return (
    <StatusDropdown
      selected={info.row.original.status}
      setSelected={async (status) => {
        await updateDriverStatus(info.row.original.id, status === 'Active');
        reload();
        info.refetch();
      }}
      options={{
        'Under Review': {
          color: '#FFA800',
          backgroundColor: '#FFF8EA',
          name: intl.formatMessage({ id: 'DRIVER.STATUS.UNDER_REVIEW' })
        },
        Active: {
          color: '#50CD89',
          backgroundColor: '#EEFAF4',
          name: intl.formatMessage({ id: 'DRIVER.STATUS.ACTIVE' })
        }
      }}
    />
  );
};

interface DriverListProps {
  refetch: () => void;
  searchQuery: string;
}

const DriversGridView: React.FC<DriverListProps> = ({ refetch, searchQuery }) => {
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();
  const dialogs = useDialogs();
  const columns = useMemo<ColumnDef<DriverDetails>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: intl.formatMessage({ id: 'DRIVER.LIST.COLUMN.FULL_NAME' }),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center me-3">
              {row.original.driver.name[0]}
            </div>
            <div>
              <div className="font-bold">{row.original.driver.name}</div>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'dateOfBirth',
        header: intl.formatMessage({ id: 'DRIVER.LIST.COLUMN.BIRTH_DATE' }),
        enableSorting: true,
        cell: ({ row }) => <div>{row.original.dateOfBirth}</div>
      },
      {
        accessorKey: 'nationality',
        header: intl.formatMessage({ id: 'DRIVER.LIST.COLUMN.NATIONALITY' }),
        enableSorting: true,
        cell: ({ row }) => (
          <span className={'px-3 py-1 rounded-full bg-blue-100 text-blue-800'}>
            {row.original.identityType === 'National ID'
              ? intl.formatMessage({ id: 'DRIVER.NATIONALITY.TURKISH' })
              : intl.formatMessage({ id: 'DRIVER.NATIONALITY.FOREIGN' })}
          </span>
        )
      },
      {
        accessorKey: 'idNumber',
        header: intl.formatMessage({ id: 'DRIVER.LIST.COLUMN.ID_NUMBER' }),
        enableSorting: true,
        cell: ({ row }) => <div>{row.original.idNumber}</div>
      },
      {
        accessorKey: 'licenseSerialNumber',
        header: intl.formatMessage({ id: 'DRIVER.LIST.COLUMN.LICENSE_NUMBER' }),
        enableSorting: true,
        cell: ({ row }) => <div>{row.original.licenseNumber}</div>
      },
      {
        accessorKey: 'licenseExpiryDate',
        header: intl.formatMessage({ id: 'DRIVER.LIST.COLUMN.LICENSE_EXPIRY' }),
        enableSorting: true,
        cell: ({ row }) => <div>{row.original.licenseExpiry}</div>
      },
      {
        accessorKey: 'vehiclePlate',
        header: intl.formatMessage({ id: 'DRIVER.LIST.COLUMN.VEHICLE' }),
        enableSorting: true,
        cell: ({ row }) => <CarView vehicle={row.original.vehicle} />
      },
      {
        accessorKey: 'status',
        header: intl.formatMessage({ id: 'DRIVER.LIST.COLUMN.STATUS' }),
        enableSorting: true,
        cell: (info) => <DriverListDropdown refetch={refetch} {...info} />
      },
      {
        id: 'actions',
        header: intl.formatMessage({ id: 'COMMON.ACTIONS' }),
        cell: ({ row }) => (
          <div className="flex gap-3">
            <Link to={`/drivers/driver/${row.original.id}`} className="size-7.5">
              <img
                src={toAbsoluteUrl('/media/icons/view.svg')}
                alt={intl.formatMessage({ id: 'COMMON.VIEW' })}
              />
            </Link>
            <Link to={`/drivers/edit/${row.original.id}`} className="size-7.5">
              <img
                src={toAbsoluteUrl('/media/icons/edit.svg')}
                alt={intl.formatMessage({ id: 'COMMON.EDIT' })}
              />
            </Link>
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
                            id: 'DRIVER.DELETE.MODAL_MESSAGE'
                          }),
                          {
                            title: intl.formatMessage({ id: 'DRIVER.DELETE.MODAL_TITLE' }),
                            okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
                            cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
                          }
                        ))
                      )
                        return;
                      const delRes = await deleteDriver(row.original.id);
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
        )
      }
    ],
    [intl, refetch, dialogs, enqueueSnackbar]
  );

  const filters = useMemo(
    () => (searchQuery.trim().length > 2 ? [{ id: '__any', value: searchQuery }] : []),
    [searchQuery]
  );

  const onFetchData = useCallback((params: any) => getDrivers(params), []);

  return (
    <div className="driver-table">
      <DataGrid
        columns={columns}
        data={[]}
        serverSide={true}
        onFetchData={onFetchData}
        filters={filters}
      />
    </div>
  );
};

export { DriversGridView };
