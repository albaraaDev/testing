import { getUsers, User } from '@/api/user';
import { Paginated } from '@/api/common';
import { KeenIcon } from '@/components';
import { Skeleton } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import { FormattedMessage, useIntl } from 'react-intl';

interface UserSelectProps {
  initialValue?: User;
  onUserChange?: (user: User | undefined) => void;
  place?: 'top' | 'bottom';
}

export const UserSelect = ({ initialValue, onUserChange, place = 'top' }: UserSelectProps) => {
  const { formatMessage } = useIntl();
  const [selectedUser, setSelectedUser] = useState<User | undefined>(initialValue);
  const [users, setUsers] = useState<Paginated<User>>();
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const remoteRowCount = useMemo(() => users?.totalCount ?? 0, [users]);

  const isRowLoaded = ({ index }: { index: number }) => !!users?.data[index];

  const loadMoreRows = async ({
    startIndex,
    stopIndex
  }: {
    startIndex: number;
    stopIndex: number;
  }) => {
    const remoteData = await getUsers({ start: startIndex, end: stopIndex, search });
    setUsers((prev) => {
      const newData = prev?.data ?? [];
      remoteData.data.forEach((user, index) => {
        newData[startIndex + index] = {
          id: user.id,
          name: user.name,
          email: user.email
        };
      });
      return {
        data: newData,
        totalCount: remoteData.totalCount
      };
    });
  };

  useEffect(() => {
    getUsers({ start: 0, end: 10, search }).then((result) => {
      const mappedUsers: Paginated<User> = {
        data: result.data.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email
        })),
        totalCount: result.totalCount
      };
      setUsers(mappedUsers);
    });
  }, [search]);

  const handleUserSelect = (user: User | undefined) => {
    setSelectedUser(user);
    onUserChange?.(user);
  };

  return (
    <div className="input shrink-0 relative">
      <input
        type="text"
        placeholder={formatMessage({ id: 'USER.SELECT.PLACEHOLDER' })}
        value={selectedUser?.name || search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button
        className="btn btn-icon"
        type="button"
        onClick={() => {
          setSearch('');
          handleUserSelect(undefined);
        }}
      >
        <KeenIcon icon="cross" />
      </button>
      {(focused || hovered) && (
        <div
          className={`absolute ${place === 'top' ? 'bottom' : 'top'}-[calc(100%+4px)] px-2 left-0 max-h-96 w-full card dark:border-gray-200 mt-1 z-50 scrollable-y overflow-hidden`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {!users && (
            <div className="p-2">
              <FormattedMessage id="COMMON.LOADING" />
            </div>
          )}
          <AutoSizer disableHeight>
            {({ width }) => (
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={loadMoreRows}
                rowCount={remoteRowCount}
              >
                {({ onRowsRendered, registerChild }) => (
                  <List
                    ref={registerChild}
                    className="scrollable-y !overflow-x-hidden"
                    height={290}
                    width={width}
                    rowCount={remoteRowCount}
                    rowHeight={35}
                    rowRenderer={({ key, index, style }) => {
                      const user = users?.data[index];

                      if (!user) {
                        return <Skeleton key={key} style={style} />;
                      }

                      return (
                        <div key={key} style={style}>
                          <div
                            className="hover:bg-gray-100 cursor-pointer h-full flex items-center"
                            onClick={() => {
                              handleUserSelect(user);
                              setHovered(false);
                            }}
                          >
                            <div className="flex flex-col truncate p-2" title={user.name}>
                              <span className="font-semibold">{user.name}</span>
                              <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                    onRowsRendered={onRowsRendered}
                  />
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        </div>
      )}
      <input type="hidden" name="userId" value={selectedUser?.id || ''} />
    </div>
  );
};
