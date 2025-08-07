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
  useDataGrid
} from '@/components';
import {
  deleteUser,
  getUsersByParentId,
  getUsersByRoleId,
  updateUserStatus,
  User,
  UserModel
} from '@/api/user';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { toAbsoluteUrl } from '@/utils';
import { StatusDropdown } from '@/pages/dashboards/blocks/StatusDropdown';
import DebouncedSearchInput from '@/components/DebouncedInputField';
import { useSettings } from '@/providers';
import { useAuthContext } from '@/auth';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router';
import { useDialogs } from '@toolpad/core/useDialogs';

const UserListDropdown = (info: CellContext<UserModel, unknown> & { refetch: () => void }) => {
  const { settings } = useSettings();
  const { currentUser } = useAuthContext();
  const intl = useIntl();

  const reload = useDataGrid().fetchServerSideData;
  return (
    <StatusDropdown
      selected={info.row.original.status.toString()}
      setSelected={async (status) => {
        await updateUserStatus(info.row.original.id, status === 'true');
        reload();
        info.refetch();
      }}
      readOnly={currentUser?.role !== 'admin'}
      options={{
        true: {
          color: '#50CD89',
          backgroundColor: settings.themeMode == 'dark' ? '#15171c' : '#ffffff',
          name: intl.formatMessage({ id: 'STATUS.ACTIVE' })
        },
        false: {
          color: '#F1416C',
          backgroundColor: settings.themeMode == 'dark' ? '#15171c' : '#ffffff',
          name: intl.formatMessage({ id: 'STATUS.INACTIVE' })
        }
      }}
    />
  );
};

interface UserListProps {
  refetch: () => void;
  filterByRoleId?: string;
}

const UserList: React.FC<UserListProps> = ({ refetch, filterByRoleId }) => {
  const { settings } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();
  const intl = useIntl();
  const [usersStack, setUsersStack] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const columns = useMemo<ColumnDef<UserModel>[]>(
    () => [
      {
        accessorKey: 'username',
        header: intl.formatMessage({ id: 'USER_PAGE.COLUMN.USERNAME' }),
        enableSorting: true,
        cell: ({ row }) => <span className="text-gray-800 font-bold">{row.original.username}</span>
      },
      {
        accessorKey: 'name',
        header: intl.formatMessage({ id: 'USER_PAGE.COLUMN.NAME' }),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center me-3">
              {row.original.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold">{row.original.name}</div>
              <div className="text-gray-500">{row.original.email}</div>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'city',
        header: intl.formatMessage({ id: 'USER_PAGE.COLUMN.CITY' }),
        enableSorting: true,
        cell: ({ row }) => <span className="text-gray-800">{row.original.city}</span>
      },
      {
        accessorKey: 'timezone',
        header: intl.formatMessage({ id: 'USER_PAGE.COLUMN.TIMEZONE' }),
        enableSorting: true,
        cell: ({ row }) => <span className="text-gray-800">{row.original.timezone}</span>
      },
      {
        accessorKey: 'subscriptionStartDate',
        header: intl.formatMessage({ id: 'USER_PAGE.COLUMN.SUBSCRIPTION_START_DATE' }),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-gray-800">{row.original.subscriptionStartDate}</span>
        )
      },
      {
        accessorKey: 'role',
        header: intl.formatMessage({ id: 'USER_PAGE.COLUMN.ROLE' }),
        enableSorting: true,
        cell: ({ row }) => <span className="text-gray-800 font-bold">{row.original.role}</span>
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: () => intl.formatMessage({ id: 'USER_PAGE.COLUMN.STATUS' }),
        enableSorting: true,
        cell: (info) => <UserListDropdown refetch={refetch} {...info} />,
        meta: {
          className: 'min-w-44'
        }
      },
      {
        id: 'actions',
        header: () => intl.formatMessage({ id: 'USER_PAGE.COLUMN.ACTIONS' }),
        cell: (info) => (
          <div className="flex gap-3">
            {!filterByRoleId && (
              <button onClick={() => updateUsersStack(info.row.original)}>
                <div className="flex justify-center items-center size-7.5 bg-gray-200 rounded-full">
                  <KeenIcon
                    icon="users"
                    className={settings.themeMode == 'dark' ? 'text-white' : 'text-black'}
                  />
                </div>
              </button>
            )}
            <Link to={`/users/user/${info.row.original.id}`} className="size-7.5">
              <img src={toAbsoluteUrl('/media/icons/view.svg')} />
            </Link>
            <Link to={`/users/edit/${info.row.original.id}`} className="size-7.5">
              <img src={toAbsoluteUrl('/media/icons/edit.svg')} />
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
                      const delRes = await deleteUser(info.row.original.id);
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
    [intl, refetch, filterByRoleId, settings.themeMode, dialogs, enqueueSnackbar]
  );

  const filters = useMemo(
    () => (searchQuery.trim().length > 2 ? [{ id: '__any', value: searchQuery }] : []),
    [searchQuery]
  );

  const onFetchData = useCallback(
    (params: any) => {
      if (filterByRoleId) {
        return getUsersByRoleId(params, filterByRoleId);
      }
      return getUsersByParentId(
        params,
        usersStack.length > 0 ? usersStack[usersStack.length - 1].id : null
      );
    },
    [filterByRoleId, usersStack]
  );

  const updateUsersStack = (user: User) => {
    setUsersStack((prevStack) => {
      if (prevStack.length > 0 && prevStack[prevStack.length - 1].id === user.id) {
        return prevStack;
      }
      const userIndex = prevStack.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        return prevStack.slice(0, userIndex + 1);
      } else {
        return [...prevStack, user];
      }
    });
  };

  const removeUsersStack = () => {
    setUsersStack([]);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between p-6">
        <h2 className="text-xl font-semibold text-gray-800">
          <FormattedMessage id="USER_PAGE.USER_LIST_TITLE" />
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <KeenIcon style="duotone" icon="magnifier" />
          </div>
          <DebouncedSearchInput
            type="search"
            className={`w-64 pl-10 pr-4 py-2 input text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-info focus:border-info`}
            placeholder={intl.formatMessage({ id: 'COMMON.SEARCH' })}
            onDebounce={setSearchQuery}
          />
        </div>
      </div>
      {!filterByRoleId && (
        <div className="flex items-center justify-start px-16 pb-6">
          <div className="flex items-center gap-4 text-sm text-gray-700 flex-wrap">
            {usersStack.length > 0 && (
              <React.Fragment>
                <button
                  onClick={() => removeUsersStack()}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FormattedMessage id="USER_PAGE.USERS" />
                </button>
                <span className="text-gray-500">/</span>
              </React.Fragment>
            )}
            {usersStack.map((user, index) => (
              <React.Fragment key={user.id}>
                <button
                  onClick={() => updateUsersStack(user)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {user.name}
                </button>
                {index < usersStack.length - 1 && <span className="text-gray-500">/</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      <div className="user-table">
        <DataGrid
          key={usersStack[usersStack.length - 1]?.id + usersStack[0]?.id}
          data={[]}
          columns={columns}
          serverSide={true}
          filters={filters}
          onFetchData={onFetchData}
        />
      </div>
    </div>
  );
};

export { UserList };
