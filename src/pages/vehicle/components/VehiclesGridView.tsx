import { DataGrid, KeenIcon, TDataGridRequestParams, useDataGrid } from '@/components';
import {
  Menu,
  MenuIcon,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuToggle
} from '@/components/menu';
import Image from '@/components/image/Image';
import { toAbsoluteUrl } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { deleteVehicle, getVehicles, updateVehicleStatus, VehicleDetails } from '@/api/cars';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import { STATUS_OPTIONS } from '../constants';
import { StatusDropdown } from '@/pages/dashboards/blocks/StatusDropdown';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDialogs } from '@toolpad/core/useDialogs';

type VehiclesGridViewProps = {
  searchQuery: string;
  refetchStats: () => void;
};

export default function VehiclesGridView({ searchQuery, refetchStats }: VehiclesGridViewProps) {
  const intl = useIntl();

  const handleGetVehicles = useCallback(async (params: TDataGridRequestParams) => {
    return await getVehicles(params);
  }, []);

  const columns = useMemo<ColumnDef<VehicleDetails>[]>(
    () => [
      {
        accessorKey: 'customer.name',
        header: intl.formatMessage({ id: 'VEHICLE.GRID.HEADER.OWNER' }),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <img
              src={
                row.original.customer.avatar ||
                toAbsoluteUrl('/media/avatars/avatar-placeholder.png')
              }
              alt={row.original.customer.name}
              className="size-9 aspect-square object-cover rounded-full"
            />
            <div className="font-bold text-[#3F4254]">{row.original.customer.name}</div>
          </div>
        )
      },
      {
        accessorKey: 'brand',
        header: intl.formatMessage({ id: 'VEHICLE.GRID.HEADER.BRAND' }),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Image
              src={toAbsoluteUrl(row.original.vehicle.brandImage)}
              className="size-9 object-cover aspect-square"
              fallback={
                <div className="bg-neutral-200 size-9 aspect-square rounded-full flex items-center justify-center">
                  <KeenIcon style="duotone" icon="car" className="text-black" />
                </div>
              }
            />
            <span className="text-[#3F4254] capitalize">{row.original.brandName}</span>
          </div>
        )
      },
      {
        accessorKey: 'plate',
        header: intl.formatMessage({ id: 'VEHICLE.GRID.HEADER.PLATE' }),
        enableSorting: true,
        cell: ({ row }) => <CarPlate plate={row.original.vehicle.plate} />
      },
      {
        accessorKey: 'gear',
        header: intl.formatMessage({ id: 'VEHICLE.GRID.HEADER.GEAR' }),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <img src={toAbsoluteUrl('/media/icons/manual.svg')} />
            <span className="capitalize">{row.original.type}</span>
          </div>
        )
      },
      {
        accessorKey: 'deviceIdent',
        header: intl.formatMessage({ id: 'VEHICLE.GRID.HEADER.DEVICE' }),
        enableSorting: true,
        cell: ({ row }) => <span className="font-monospace">{row.original.vehicle.imei}</span>
      },
      {
        accessorKey: 'maintenanceMileage',
        header: intl.formatMessage({ id: 'VEHICLE.GRID.HEADER.MAINTENANCE_MILEAGE' }),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <img src={toAbsoluteUrl('/media/icons/gauge.svg')} />
            <span className="uppercase">{row.original.mileage}</span>
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: intl.formatMessage({ id: 'VEHICLE.GRID.HEADER.STATUS' }),
        enableSorting: true,
        cell: ({ row }) => (
          <GridViewStatusDropdown vehicleDetails={row.original} refetchStats={refetchStats} />
        )
      },
      {
        id: 'actions',
        header: intl.formatMessage({ id: 'VEHICLE.GRID.HEADER.ACTIONS' }),
        cell: ({ row }) => (
          <ActionsDropdown vehicleId={row.original.vehicle.id} carId={row.original.carId} />
        )
      }
    ],
    [refetchStats, intl]
  );

  const filters = useMemo(
    () => (searchQuery.trim().length >= 1 ? [{ id: '__any', value: searchQuery.trim() }] : []),
    [searchQuery]
  );

  const onFetchData = useCallback(
    (params: TDataGridRequestParams) =>
      handleGetVehicles({
        ...params
      }),
    [handleGetVehicles]
  );

  return <DataGrid columns={columns} serverSide onFetchData={onFetchData} filters={filters} />;
}

const ActionsDropdown = ({ vehicleId, carId }: { vehicleId: string; carId: string }) => {
  const reload = useDataGrid().fetchServerSideData;
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();
  const intl = useIntl();

  return (
    <div className="flex gap-3 items-center justify-center">
      <Link
        to={'/vehicles/vehicle/' + vehicleId}
        className="p-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#5271FF]/10"
        title={intl.formatMessage({ id: 'VEHICLE.GRID.ACTION.VIEW' })}
      >
        <img
          src={toAbsoluteUrl('/media/icons/view-light.svg')}
          alt={intl.formatMessage({ id: 'COMMON.VIEW' })}
        />
      </Link>
      <Link
        to={'/vehicles/edit/' + vehicleId}
        className="p-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#50CD89]/10"
        title={intl.formatMessage({ id: 'VEHICLE.GRID.ACTION.EDIT' })}
      >
        <img
          src={toAbsoluteUrl('/media/icons/edit-light.svg')}
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
                      id: 'VEHICLE.DELETE.MODAL_MESSAGE'
                    }),
                    {
                      title: intl.formatMessage({ id: 'VEHICLE.DELETE.MODAL_TITLE' }),
                      okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
                      cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
                    }
                  ))
                )
                  return;
                const delRes = await deleteVehicle(carId);
                enqueueSnackbar(delRes.message, {
                  variant: 'success'
                });
                reload();
              }}
            >
              <MenuLink>
                <MenuIcon>
                  <img src={toAbsoluteUrl('/media/icons/delete-light.svg')} />
                </MenuIcon>
                <MenuTitle>
                  <FormattedMessage id="VEHICLE.GRID.ACTION.DELETE" />
                </MenuTitle>
              </MenuLink>
            </MenuItem>
          </MenuSub>
        </MenuItem>
      </Menu>
    </div>
  );
};

type StatusDropdownProps = {
  vehicleDetails: VehicleDetails;
  refetchStats: () => void;
};

function GridViewStatusDropdown({ vehicleDetails, refetchStats }: StatusDropdownProps) {
  const refetch = useDataGrid().fetchServerSideData;

  return (
    <StatusDropdown
      selected={vehicleDetails.status}
      setSelected={async (value) => {
        await updateVehicleStatus(vehicleDetails.carId, value);
        refetch();
        refetchStats();
      }}
      options={STATUS_OPTIONS}
    />
  );
}
