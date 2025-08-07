import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUsers, getUser, getUserModel, getUsersUnderParent, UserModel } from '@/api/user';
import { CircularProgress } from '@mui/material';
import { Paginated } from '@/api/common';
import { KeenIcon } from '@/components';
import { Skeleton } from '@mui/material';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import { FormattedMessage, useIntl } from 'react-intl';

interface UserSearchProps {
  search?: string;
  setSearch?: (value: string) => void;
  parentId?: string;
  onSelectUserId?: (userId: string, name: string) => void;
  initialSearch?: string;
}

const UserSearch = ({
  search,
  setSearch,
  parentId,
  onSelectUserId,
  initialSearch
}: UserSearchProps) => {
  const intl = useIntl();
  const [privateSearch, setPrivateSearch] = useState(initialSearch ?? '');
  const [users, setUsers] = useState<Paginated<UserModel>>();
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
    const remoteData = parentId
      ? await getUsersUnderParent(parentId, { start: startIndex, end: stopIndex })
      : await getUsers({ start: startIndex, end: stopIndex });
    setUsers((prev) => {
      const newData = prev?.data ?? [];
      remoteData.data.forEach((car, index) => {
        newData[startIndex + index] = car;
      });
      return {
        data: newData,
        totalCount: remoteData.totalCount
      };
    });
  };

  useEffect(() => {
    if (!parentId) {
      getUsers({ start: 0, end: 10, search: search ?? privateSearch }).then(setUsers);
    } else {
      getUsersUnderParent(parentId, { start: 0, end: 10, search: search ?? privateSearch }).then(
        setUsers
      );
    }
  }, [parentId, privateSearch, search]);

  useEffect(() => {
    if (initialSearch) setPrivateSearch(initialSearch);
  }, [initialSearch]);

  return (
    <div className="input input-sm h-[34px] shrink-0 relative">
      <input
        type="text"
        placeholder={intl.formatMessage({ id: 'USER.SEARCH.PLACEHOLDER' })}
        value={search ?? privateSearch}
        onChange={(e) => (setSearch ? setSearch(e.target.value) : setPrivateSearch(e.target.value))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button
        className="btn btn-icon"
        type="button"
        onClick={() => {
          setSearch ? setSearch('') : setPrivateSearch('');
          onSelectUserId?.('', '');
        }}
      >
        <KeenIcon icon="cross" />
      </button>
      {(focused || hovered) && (
        <div
          className="absolute bottom-[calc(100%+4px)] left-0 w-full max-h-96 card dark:border-gray-200 mt-1 z-50 scrollable-y"
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
                    className="scrollable-y px-2 !overflow-x-hidden"
                    height={384}
                    width={width}
                    rowCount={remoteRowCount}
                    rowHeight={28}
                    rowRenderer={({ key, index, style }) => {
                      const user = users?.data[index];

                      if (!user) {
                        return <Skeleton key={key} style={style} />;
                      }

                      return (
                        <div key={key} style={style}>
                          <div
                            key={user.username}
                            className="p-2 hover:bg-gray-100 flex justify-between items-center gap-2 cursor-pointer"
                            onClick={() => {
                              if (setSearch) {
                                setSearch(user.name);
                              } else {
                                setPrivateSearch(user.name);
                              }
                              onSelectUserId?.(user.id, user.name);
                              setHovered(false);
                            }}
                          >
                            <div>{user.name}</div>
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
    </div>
  );
};

export const ParentUserPicker = ({ userId, fieldName }: { userId?: string; fieldName: string }) => {
  const [loading, setLoading] = useState(false);
  const [userTree, setUserTree] = useState<({ name: string; id: string } | null)[]>([null]);
  useEffect(() => {
    const lastUser = userTree[userTree.length - 1];
    if (lastUser && lastUser.id) {
      getUsersUnderParent(lastUser.id, { start: 0, end: 0 }).then((users) => {
        if (users.totalCount > 0) {
          setUserTree((prev) => {
            if (prev[prev.length - 1]?.id === lastUser.id) {
              return prev.concat(null);
            }
            return prev;
          });
        }
      });
    }
  }, [userTree]);
  const selectedUser = useMemo(() => {
    for (let i = userTree.length - 1; i >= 0; i--) {
      if (userTree[i]?.id?.length && userTree[i]?.id.length! > 0) {
        return userTree[i];
      }
    }
    return null;
  }, [userTree]);

  const getParent = async (id: string | UserModel) => {
    const user = typeof id === 'string' ? await getUserModel(id) : id;
    if (!user.parentId) {
      return null;
    }
    return await getUser(user.parentId);
  };

  const getParents = useCallback(async (id: string) => {
    const parents: { name: string; id: string }[] = [];
    const user = await getUserModel(id);
    parents.push({ name: user.name, id: user.id });
    let parent = await getParent(user);
    while (parent) {
      parents.push({ id: parent.id, name: parent.name });
      parent = await getParent(parent.id);
    }
    return parents.reverse();
  }, []);

  // Populate the user tree if the device has a user
  useEffect(() => {
    if (!userId) {
      return;
    }
    setLoading(true);
    getParents(userId)
      .then(setUserTree)
      .then(() => setLoading(false));
  }, [userId, getParents]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-16">
          <CircularProgress />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DEVICE.FORM.USER" />
            </label>
            <UserSearch
              onSelectUserId={(id, name) => {
                setUserTree((prev) => {
                  const newTree = prev.slice(0, 0);
                  newTree.push({ id, name });
                  return newTree;
                });
              }}
              initialSearch={userTree[0]?.name}
            />
          </div>
          {userTree.slice(1).map((_, index) => (
            <div key={index} className="grid gap-2.5">
              <label className="form-label">
                <FormattedMessage id="DEVICE.FORM.SUBUSER" values={{ number: index + 1 }} />
              </label>
              <UserSearch
                parentId={userTree[index]?.id}
                onSelectUserId={(id, name) => {
                  setUserTree((prev) => {
                    const newTree = prev.slice(0, index + 1);
                    newTree.push({ id, name });
                    return newTree;
                  });
                }}
                initialSearch={userTree[index + 1]?.name}
              />
            </div>
          ))}
        </div>
      )}
      <input type="hidden" name={fieldName} value={selectedUser ? selectedUser.id : ''} />
    </>
  );
};
