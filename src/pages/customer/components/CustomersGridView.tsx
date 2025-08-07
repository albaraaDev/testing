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
import { toAbsoluteUrl } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import {
  deleteCustomer,
  getCustomers,
  updateCustomerStatus,
  CustomerDetails
} from '@/api/customers';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDialogs } from '@toolpad/core/useDialogs';
import { StatusDropdown } from '@/pages/dashboards/blocks/StatusDropdown';
import { STATUS_OPTIONS } from '../constants';

type CustomersGridViewProps = {
  searchQuery: string;
  refetchStats: () => void;
};

export default function CustomersGridView({ searchQuery, refetchStats }: CustomersGridViewProps) {
  const intl = useIntl();

  const handleGetCustomers = useCallback(async (params: TDataGridRequestParams) => {
    return await getCustomers(params);
  }, []);

  const columns = useMemo<ColumnDef<CustomerDetails>[]>(
    () => [
      {
        accessorKey: 'fullname',
        header: intl.formatMessage({ id: 'CUSTOMER.GRID.HEADER.OWNER' }),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="font-bold text-[#3F4254]">{row.original.fullName}</div>
          </div>
        )
      },
      {
        accessorKey: 'email',
        header: intl.formatMessage({ id: 'CUSTOMER.GRID.HEADER.EMAIL' }),
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.email}</span>
      },
      {
        accessorKey: 'phone',
        header: intl.formatMessage({ id: 'CUSTOMER.GRID.HEADER.PHONE' }),
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.firstPhone}</span>
      },
      {
        accessorKey: 'status',
        header: intl.formatMessage({ id: 'CUSTOMER.GRID.HEADER.STATUS' }),
        enableSorting: true,
        cell: ({ row }) => (
          <GridViewStatusDropdown customerDetails={row.original} refetchStats={refetchStats} />
        )
      },
      {
        accessorKey: 'identityType',
        header: intl.formatMessage({ id: 'CUSTOMER.GRID.HEADER.IDENTITY_TYPE' }),
        enableSorting: true,
        cell: ({ row }) => {
          return <span className="capitalize">{row.original.identityType}</span>;
        }
      },
      {
        accessorKey: 'customer.licenseIssueDate',
        header: intl.formatMessage({ id: 'CUSTOMER.GRID.HEADER.LICENSE_ISSUE_DATE' }),
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.licenseIssueDate}</span>
      },
      {
        accessorKey: 'customer.licenseExpiryDate',
        header: intl.formatMessage({ id: 'CUSTOMER.GRID.HEADER.LICENSE_EXPIRY_DATE' }),
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.licenseExpiryDate}</span>
      },
      {
        accessorKey: 'customer.dateOfBirth',
        header: intl.formatMessage({ id: 'CUSTOMER.GRID.HEADER.DATE_OF_BIRTH' }),
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.dateOfBirth}</span>
      },
      {
        id: 'actions',
        header: intl.formatMessage({ id: 'CUSTOMER.GRID.HEADER.ACTIONS' }),
        cell: ({ row }) => <ActionsDropdown customerId={row.original.id} />
      }
    ],
    [intl]
  );

  const filters = useMemo(
    () => (searchQuery.trim().length >= 1 ? [{ id: '__any', value: searchQuery.trim() }] : []),
    [searchQuery]
  );

  const onFetchData = useCallback(
    (params: TDataGridRequestParams) =>
      handleGetCustomers({
        ...params
      }),
    [handleGetCustomers]
  );

  return <DataGrid columns={columns} serverSide onFetchData={onFetchData} filters={filters} />;
}

const ActionsDropdown = ({ customerId }: { customerId: string }) => {
  const reload = useDataGrid().fetchServerSideData;
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();
  const intl = useIntl();

  return (
    <div className="flex gap-3 items-center justify-center">
      <Link
        to={'/customers/customer/' + customerId}
        className="p-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#5271FF]/10"
        title={intl.formatMessage({ id: 'CUSTOMER.GRID.ACTION.VIEW' })}
      >
        <img
          src={toAbsoluteUrl('/media/icons/view-light.svg')}
          alt={intl.formatMessage({ id: 'COMMON.VIEW' })}
        />
      </Link>
      <Link
        to={'/customers/edit/' + customerId}
        className="p-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#50CD89]/10"
        title={intl.formatMessage({ id: 'CUSTOMER.GRID.ACTION.EDIT' })}
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
                      id: 'CUSTOMER.DELETE.MODAL_MESSAGE'
                    }),
                    {
                      title: intl.formatMessage({ id: 'CUSTOMER.DELETE.MODAL_TITLE' }),
                      okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
                      cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
                    }
                  ))
                )
                  return;
                const delRes = await deleteCustomer(customerId);
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
                  <FormattedMessage id="CUSTOMER.GRID.ACTION.DELETE" />
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
  customerDetails: CustomerDetails;
  refetchStats: () => void;
};

function GridViewStatusDropdown({ customerDetails, refetchStats }: StatusDropdownProps) {
  const refetch = useDataGrid().fetchServerSideData;

  return (
    <StatusDropdown
      selected={customerDetails.status!.toString()}
      setSelected={async (value) => {
        await updateCustomerStatus(customerDetails.id, value === 'true');
        refetch();
        refetchStats();
      }}
      options={STATUS_OPTIONS}
    />
  );
}
