import { Paginated } from '@/api/common';
import { DeviceWithoutVehicleDTO, getDevicesWithoutVehicle } from '@/api/devices';
import { KeenIcon } from '@/components';
import { Skeleton } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormikContext } from 'formik';
import { VehicleDTO } from '@/api/cars';
import { enqueueSnackbar } from 'notistack';

interface DeviceSearchProps {
  place?: 'top' | 'bottom';
}

export const DeviceSearch = ({ place = 'top' }: DeviceSearchProps) => {
  const intl = useIntl();
  const { formatMessage } = useIntl();
  const { values, setFieldValue } = useFormikContext<VehicleDTO>();
  const [privateSearch, setPrivateSearch] = useState(values.deviceIdent);
  const [devices, setDevices] = useState<Paginated<DeviceWithoutVehicleDTO>>();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const remoteRowCount = useMemo(() => devices?.totalCount ?? 0, [devices]);

  const getDevicesCB = useCallback(
    async (params: { offset: number; size: number; search?: string }) => {
      const { offset, size, search } = params;
      try {
        const response = await getDevicesWithoutVehicle({
          offset,
          size,
          search
        });

        const result = response.result;

        if (response.success === false || !result) {
          enqueueSnackbar(response.message, { variant: 'error' });
          return { data: [], totalCount: 0 };
        }

        return {
          data: result.content,
          totalCount: result.totalElements
        };
      } catch (error) {
        console.error('Error fetching devices:', error);
        enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), { variant: 'error' });
        return { data: [], totalCount: 0 };
      }
    },
    [intl]
  );

  const isRowLoaded = ({ index }: { index: number }) => !!devices?.data[index];
  const loadMoreRows = async ({
    startIndex,
    stopIndex
  }: {
    startIndex: number;
    stopIndex: number;
  }) => {
    const remoteData = await getDevicesCB({
      offset: startIndex,
      size: stopIndex - startIndex + 1,
      search: privateSearch || ''
    });
    setDevices((prev) => {
      const newData = prev?.data ?? [];
      remoteData.data.forEach((device, index) => {
        newData[startIndex + index] = device;
      });
      return {
        data: newData,
        totalCount: remoteData.totalCount
      };
    });
  };

  useEffect(() => {
    getDevicesCB({ offset: 0, size: 10, search: privateSearch || '' }).then(setDevices);
  }, [getDevicesCB, privateSearch]);

  return (
    <>
      <div className="input shrink-0 relative">
        <input
          type="text"
          name="deviceIdent"
          placeholder={formatMessage({ id: 'DEVICE.FORM.IDENTIFY_NUMBER.PLACEHOLDER' })}
          value={privateSearch}
          onChange={(e) => setPrivateSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button
          className="btn btn-icon"
          type="button"
          onClick={() => {
            setFieldValue('deviceIdent', '');
            setFieldValue('deviceId', '');
            setFieldValue('userId', '');
            setPrivateSearch('');
          }}
        >
          <KeenIcon icon="cross" />
        </button>
        {(focused || hovered) && (
          <div
            className={`absolute ${place === 'top' ? 'bottom' : 'top'}-[calc(100%+4px)] px-2 left-0 w-full max-h-96 card dark:border-gray-200 mt-1 z-50`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {!devices && (
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
                        const device = devices?.data[index];

                        if (!device) {
                          return <Skeleton key={key} style={style} />;
                        }

                        return (
                          <div key={key} style={style}>
                            <div
                              key={device.id}
                              className="p-2 h-full hover:bg-gray-100 flex justify-between items-center gap-2 cursor-pointer"
                              onClick={() => {
                                setPrivateSearch(device.ident);
                                setFieldValue('deviceIdent', device.ident);
                                setFieldValue('deviceId', device.id);
                                setFieldValue('userId', device.userId);
                                setHovered(false);
                              }}
                            >
                              <span className="font-monospace">{device.ident}</span>
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
      {!(values.deviceId || values.deviceIdent || values.userId) && privateSearch && (
        <div className="text-red-500 text-xs mt-1">
          <FormattedMessage id="DEVICE.FORM.IDENTIFY_NUMBER.REQUIRED" />
        </div>
      )}
    </>
  );
};
