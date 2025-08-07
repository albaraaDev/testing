import { DataGrid, KeenIcon } from '@/components';
import {
  Menu,
  MenuIcon,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuToggle
} from '@/components/menu';
import { toAbsoluteUrl } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDialogs } from '@toolpad/core/useDialogs';
import {
  deleteReservation,
  getReservations,
  getReservationsByCustomer,
  ReservationDetails,
  reservationStatusKey,
  reservationTypeOfRentKey
} from '@/api/reservations';
import React from 'react';
import ExtendIcon from '@/assets/svg/Extend';

type ReservationsGridViewProps = {
  searchQuery: string;
  customerId?: string | null;
};

export default function ReservationsGridView({
  searchQuery,
  customerId
}: ReservationsGridViewProps) {
  const intl = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();

  const dataGridKey = useRef(Date.now());

  const refetch = () => {
    dataGridKey.current = Date.now();
  };

  const reservationColumns = useMemo<ColumnDef<ReservationDetails>[]>(
    () => [
      {
        accessorKey: 'customerFullName',
        header: intl.formatMessage({ id: 'RESERVATIONS.COLUMN.CUSTOMER_FULL_NAME' })
      },
      {
        accessorKey: 'status',
        header: intl.formatMessage({ id: 'RESERVATIONS.COLUMN.STATUS' }),
        cell: ({ row }) => (
          <FormattedMessage
            id={reservationStatusKey(row.original.status)}
            defaultMessage="Unknown"
          />
        )
      },
      {
        accessorKey: 'typeOfRent',
        header: intl.formatMessage({ id: 'RESERVATIONS.COLUMN.TYPE_OF_RENT' }),
        cell: ({ row }) => (
          <FormattedMessage
            id={reservationTypeOfRentKey(row.original.typeOfRent)}
            defaultMessage="Unknown"
          />
        )
      },
      {
        accessorKey: 'totalAmount',
        header: intl.formatMessage({ id: 'RESERVATIONS.COLUMN.TOTAL_AMOUNT' }),
        cell: ({ row }) => <span>{row.original.totalAmount.toFixed(2)}</span>
      },
      {
        accessorKey: 'pickUpDate',
        header: intl.formatMessage({ id: 'RESERVATIONS.COLUMN.PICKUP_DATE' }),
        cell: ({ row }) => (
          <span>
            {new Date(row.original.pickUpDate).toLocaleDateString(intl.locale, {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
          </span>
        )
      },
      {
        accessorKey: 'dropOffDate',
        header: intl.formatMessage({ id: 'RESERVATIONS.COLUMN.DROPOFF_DATE' }),
        cell: ({ row }) => (
          <span>
            {new Date(row.original.dropOffDate).toLocaleDateString(intl.locale, {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
          </span>
        )
      },
      // TODO(adnanjpg) WAITING_API
      // {
      //   accessorKey: 'vehicleTitle',
      //   header: intl.formatMessage({ id: 'RESERVATIONS.COLUMN.VEHICLE_TITLE' }),
      //   cell: ({ row }) => <span>{row.original.vehicleId}</span>
      // },
      // {
      //   accessorKey: 'vehiclePlate',
      //   header: intl.formatMessage({ id: 'RESERVATIONS.COLUMN.VEHICLE_PLATE' }),
      //   cell: ({ row }) => <span>{row.original.vehicleId}</span>
      // },
      {
        accessorKey: 'receive',
        header: intl.formatMessage({ id: 'RESERVATIONS.COLUMN.RECEIVE' }),
        cell: ({ row }) => {
          const pickUpDate = new Date(row.original.pickUpDate);
          const dropOffDate = new Date(row.original.dropOffDate);
          const receiveDays = Math.ceil(
            (dropOffDate.getTime() - pickUpDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return (
            <FormattedMessage
              id="COMMON.DAYS"
              defaultMessage="Receive in {count} days"
              values={{ count: receiveDays }}
            />
          );
        }
      },
      {
        accessorKey: 'endsIn',
        header: intl.formatMessage({ id: 'RESERVATIONS.COLUMN.ENDS_IN' }),
        cell: ({ row }) => {
          const dropOffDate = new Date(row.original.dropOffDate);
          const now = new Date();
          const endsInDays = Math.ceil(
            (dropOffDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          return (
            <FormattedMessage
              id="COMMON.DAYS"
              defaultMessage="Ends in {count} days"
              values={{ count: endsInDays }}
            />
          );
        }
      },
      {
        id: 'actions',
        header: intl.formatMessage({ id: 'COMMON.ACTIONS' }),
        cell: ({ row }) => (
          <div className="flex gap-3">
            <Link to={`/reservations/reservation/${row.original.id}`} className="size-7.5">
              <img
                src={toAbsoluteUrl('/media/icons/view.svg')}
                alt={intl.formatMessage({ id: 'COMMON.VIEW' })}
              />
            </Link>
            <Link to={`/reservations/edit/${row.original.id}`} className="size-7.5">
              <img
                src={toAbsoluteUrl('/media/icons/edit.svg')}
                alt={intl.formatMessage({ id: 'COMMON.EDIT' })}
                className="size-7.5"
              />
            </Link>
            <Link
              to={`/reservations/handover/${row.original.id}`}
              className="size-7.5 flex flex-col items-center justify-center"
            >
              <ExtendIcon className="size-5" />
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
                            id: 'DEVICE.DELETE.MODAL_MESSAGE'
                          }),
                          {
                            title: intl.formatMessage({ id: 'DEVICE.DELETE.MODAL_TITLE' }),
                            okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
                            cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
                          }
                        ))
                      )
                        return;
                      const deleteRes = await deleteReservation(row.original.id);
                      enqueueSnackbar(deleteRes.message, {
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
    [intl]
  );

  return (
    <DataGrid
      key={`reservations-${customerId}-${dataGridKey.current}`}
      columns={reservationColumns}
      onFetchData={async (params) =>
        customerId ? await getReservationsByCustomer(params, customerId) : getReservations(params)
      }
      serverSide={true}
      pagination={{ size: 10 }}
      filters={[...(searchQuery.length > 0 ? [{ id: '__any', value: searchQuery }] : [])]}
    />
  );
}
