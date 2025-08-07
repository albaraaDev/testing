import { DeviceDTO } from '@/api/devices';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import { KeenIcon } from '@/components';
import { Skeleton } from '@mui/material';
import { getDistributors, UserModel } from '@/api/user';
import { Paginated } from '@/api/common';
import { enqueueSnackbar } from 'notistack';

export const DistributorDropdown = (props: {
  device: DeviceDTO | undefined;
  required: boolean;
}) => {
  const { device, required } = props;
  const distributorId = useMemo(() => {
    return device?.distributorId || '';
  }, [device?.distributorId]);
  const intl = useIntl();
  const { formatMessage } = intl;
  const [privateSearch, setPrivateSearch] = useState('');
  const [selectedDistributorId, setSelectedDistributorId] = useState(distributorId || '');
  const [distributors, setDistributors] = useState<Paginated<UserModel>>();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const remoteRowCount = useMemo(() => distributors?.totalCount ?? 0, [distributors]);

  const getDistributorsCB = useCallback(
    async (params: { offset: number; size: number; search?: string }) => {
      const { offset, size, search } = params;
      try {
        const response = await getDistributors({
          start: offset,
          end: offset + size - 1,
          search
        });

        return {
          data: response.data,
          totalCount: response.totalCount
        };
      } catch (error) {
        console.error('Error fetching distributors:', error);
        enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), { variant: 'error' });
        return { data: [], totalCount: 0 };
      }
    },
    [intl]
  );

  const isRowLoaded = ({ index }: { index: number }) => !!distributors?.data[index];

  const loadMoreRows = async ({
    startIndex,
    stopIndex
  }: {
    startIndex: number;
    stopIndex: number;
  }) => {
    const remoteData = await getDistributorsCB({
      offset: startIndex,
      size: stopIndex - startIndex + 1,
      search: privateSearch || ''
    });

    setDistributors((prev) => {
      const newData = prev?.data ?? [];
      remoteData.data.forEach((distributor, index) => {
        newData[startIndex + index] = distributor;
      });
      return {
        data: newData,
        totalCount: remoteData.totalCount
      };
    });
  };

  useEffect(() => {
    getDistributorsCB({ offset: 0, size: 10, search: privateSearch || '' }).then(setDistributors);
  }, [distributorId, getDistributorsCB, privateSearch]);

  const [userIsSetBefore, setUserIsSetBefore] = useState(false);
  useEffect(() => {
    if (userIsSetBefore) return;
    if (distributorId && distributors) {
      const selectedDistributor = distributors?.data.find(
        (distributor) => distributor.id === distributorId
      );
      if (selectedDistributor) {
        setPrivateSearch(selectedDistributor.name);
        setSelectedDistributorId(selectedDistributor.id);
      } else {
        setPrivateSearch('');
        setSelectedDistributorId('');
      }

      setUserIsSetBefore(true);
    }
  }, [distributorId, distributors, userIsSetBefore]);

  return (
    <>
      <div className="grid gap-2.5">
        <label className="form-label">
          <FormattedMessage id="DEVICE.FORM.DISTRIBUTOR" />
        </label>
        <div className="input shrink-0 relative">
          <input
            required={required}
            type="text"
            className="w-full dark:[color-scheme:dark]"
            name="distributor"
            placeholder={formatMessage({ id: 'DEVICE.FORM.DISTRIBUTOR.PLACEHOLDER' })}
            value={privateSearch}
            onChange={(e) => setPrivateSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <button
            className="btn btn-icon"
            type="button"
            onClick={() => {
              setPrivateSearch('');
              setSelectedDistributorId('');
            }}
          >
            <KeenIcon icon="cross" />
          </button>
          {(focused || hovered) && (
            <div
              className="absolute bottom-[calc(100%+4px)] px-2 left-0 w-full max-h-96 card dark:border-gray-200 mb-1 z-50"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {!distributors && (
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
                        height={384}
                        width={width}
                        rowCount={remoteRowCount}
                        rowHeight={52}
                        rowRenderer={({ key, index, style }) => {
                          const distributor = distributors?.data[index];

                          if (!distributor) {
                            return <Skeleton key={key} style={style} />;
                          }

                          return (
                            <div key={key} style={style}>
                              <div
                                key={distributor.id}
                                className="p-2 h-full hover:bg-gray-100 flex justify-between items-center gap-2 cursor-pointer"
                                onClick={() => {
                                  setPrivateSearch(distributor.name);
                                  setSelectedDistributorId(distributor.id);
                                  setHovered(false);
                                }}
                              >
                                <span>{distributor.name}</span>
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
      </div>
      {selectedDistributorId && (
        <input type="hidden" name="distributorId" value={selectedDistributorId} />
      )}
      {selectedDistributorId && (
        <input
          type="hidden"
          name="distributorName"
          value={distributors?.data?.find((x) => x.id == selectedDistributorId)?.name || ''}
        />
      )}
      {required && !selectedDistributorId && privateSearch && (
        <div className="text-red-500 text-xs mt-1">
          <FormattedMessage id="DEVICE.FORM.DISTRIBUTOR.REQUIRED" />
        </div>
      )}
    </>
  );
};
