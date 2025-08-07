import { AddUserPageProps } from '../AddUserPage';
import {
  DeviceDTO,
  getDevicesByDistributor,
  getLinkedDevicesByUser,
  getUnlinkedDevices,
  unlinkLinkDevice,
  UserType
} from '@/api/devices';
import React, { useCallback, useEffect, useState } from 'react';
import { CircularProgress, Skeleton } from '@mui/material';
import { KeenIcon } from '@/components';
import DebouncedSearchInput from '@/components/DebouncedInputField';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import { FormattedMessage, useIntl } from 'react-intl';
import { enqueueSnackbar } from 'notistack';
import { Paginated } from '@/api/common';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import logger from '@/utils/Logger';

const DeviceLinking = (props: {
  userId?: string | null;
  onClose?: () => void;
  onSuccess?: () => void;
  userType: UserType;
}) => {
  const { userId, onClose, onSuccess, userType } = props;

  const intl = useIntl();
  const [linkedDevicesSearch, setLinkedDevicesSearch] = useState<string>('');
  const [unlinkedDevicesSearch, setUnlinkedDevicesSearch] = useState<string>('');
  const [linkedDevices, setLinkedDevices] = useState<Paginated<DeviceDTO>>();
  const [unlinkedDevices, setUnlinkedDevices] = useState<Paginated<DeviceDTO>>();
  const [lastLinkedDevices, setLastLinkedDevices] = useState(10);
  const [lastUnlinkedDevices, setLastUnlinkedDevices] = useState(10);
  const [devicesToLink, setDevicesToLink] = useState<string[]>([]);
  const [devicesToUnlink, setDevicesToUnlink] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getLinkedDevicesCB = useCallback(
    async (
      userId: string,
      offset: number,
      size: number,
      search: string,
      userType: UserType = 'user'
    ): Promise<Paginated<DeviceDTO>> => {
      const requestParams = {
        offset,
        size,
        search: search || '',
        page: 0,
        sort: 'id,desc'
      };

      try {
        const response =
          userType === 'distributor'
            ? await getDevicesByDistributor(userId, requestParams)
            : await getLinkedDevicesByUser(userId, requestParams);

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
        console.error('Error fetching linked devices:', error);
        enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), { variant: 'error' });
        return { data: [], totalCount: 0 };
      }
    },
    [intl]
  );
  const getUnLinkedDevicesCB = useCallback(
    async (offset: number, size: number, search: string): Promise<Paginated<DeviceDTO>> => {
      const requestParams = {
        offset,
        size,
        search: search || '',
        page: 0,
        sort: 'id,desc',
        type: userType
      };

      try {
        const response = await getUnlinkedDevices(requestParams);

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
        console.error('Error fetching linked devices:', error);
        enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), { variant: 'error' });
        return { data: [], totalCount: 0 };
      }
    },
    [intl, userType]
  );

  useEffect(() => {
    getUnLinkedDevicesCB(0, 10, unlinkedDevicesSearch).then(setUnlinkedDevices);
  }, [getUnLinkedDevicesCB, unlinkedDevicesSearch]);

  useEffect(() => {
    if (!userId) {
      setLinkedDevices({ data: [], totalCount: 0 });
      return;
    }

    getLinkedDevicesCB(userId, 0, 10, linkedDevicesSearch, userType).then(setLinkedDevices);
  }, [getLinkedDevicesCB, linkedDevicesSearch, userId, userType]);

  const update = useCallback(() => {
    if (!userId) {
      return;
    }

    getUnLinkedDevicesCB(0, lastUnlinkedDevices, unlinkedDevicesSearch).then(setUnlinkedDevices);

    getLinkedDevicesCB(userId, 0, lastLinkedDevices, linkedDevicesSearch).then(setLinkedDevices);
  }, [
    userId,
    getUnLinkedDevicesCB,
    lastUnlinkedDevices,
    unlinkedDevicesSearch,
    getLinkedDevicesCB,
    lastLinkedDevices,
    linkedDevicesSearch
  ]);

  const toggleLinkDevice = useCallback((deviceIdent: string) => {
    logger.debug('Toggling link for device:', deviceIdent);
    setDevicesToLink((prev) => {
      if (prev.includes(deviceIdent)) {
        return prev.filter((id) => id !== deviceIdent);
      } else {
        return [...prev, deviceIdent];
      }
    });
  }, []);

  const toggleUnlinkDevice = useCallback((deviceIdent: string) => {
    logger.debug('Toggling unlink for device:', deviceIdent);
    setDevicesToUnlink((prev) => {
      if (prev.includes(deviceIdent)) {
        return prev.filter((id) => id !== deviceIdent);
      } else {
        return [...prev, deviceIdent];
      }
    });
  }, []);

  const handleSaveChanges = async () => {
    if (!userId) return;

    setIsSubmitting(true);
    try {
      let res1, res2;
      // Separate API call for devices to link
      if (devicesToLink.length > 0) {
        logger.debug('Linking devices:', devicesToLink);
        res1 = await unlinkLinkDevice(userId, devicesToLink, userType);
      }

      // Separate API call for devices to unlink
      if (devicesToUnlink.length > 0) {
        logger.debug('Unlinking devices:', devicesToUnlink);
        // Using null for unlinking devices
        res2 = await unlinkLinkDevice('null', devicesToUnlink, userType);
      }

      const r1Msg = res1?.message,
        res2Msg = res2?.message;

      if (r1Msg || res2Msg) {
        const msgsEqual = r1Msg === res2Msg;
        if (msgsEqual) {
          enqueueSnackbar(r1Msg, { variant: 'success' });
        } else {
          if (r1Msg) {
            enqueueSnackbar(r1Msg, { variant: 'success' });
          }
          if (res2Msg) {
            enqueueSnackbar(res2Msg, { variant: 'success' });
          }
        }
      }

      // Reset selections
      setDevicesToLink([]);
      setDevicesToUnlink([]);

      // Update the device lists
      update();

      onSuccess?.();
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSelection = () => {
    setDevicesToLink([]);
    setDevicesToUnlink([]);
    onClose?.();
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="grid lg:grid-cols-2 gap-4 h-full grow">
        <div className="card pb-2.5">
          <div className="p-4 gap-4 flex flex-col w-full items-center justify-between">
            <div className="flex items-center justify-between gap-2 w-full">
              <h3 className="card-title text-nowrap">
                <FormattedMessage id="DEVICE.GRID.UNLINKED_DEVICES" />
              </h3>
              <div className="flex items-center gap-2">
                {unlinkedDevices?.totalCount !== undefined && (
                  <h5 className="text-sm text-gray-400 text-nowrap">
                    <FormattedMessage
                      id="DEVICE.GRID.DEVICES_COUNT"
                      values={{ count: unlinkedDevices.totalCount }}
                    />
                  </h5>
                )}
              </div>
            </div>
            {unlinkedDevices && (
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <KeenIcon style="duotone" icon="magnifier" />
                </div>
                <DebouncedSearchInput
                  type="search"
                  className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-info focus:border-info"
                  placeholder={intl.formatMessage({ id: 'COMMON.SEARCH' })}
                  onDebounce={setUnlinkedDevicesSearch}
                />
              </div>
            )}
            {devicesToLink.length > 0 && (
              <span className="text-xs text-success font-semibold text-nowrap">
                {devicesToLink.length} <FormattedMessage id="COMMON.SELECTED" />
              </span>
            )}
          </div>
          <div className="card-body p-0">
            {unlinkedDevices ? (
              <AutoSizer>
                {({ height, width }) => (
                  <InfiniteLoader
                    isRowLoaded={({ index }) => !!unlinkedDevices.data[index]}
                    loadMoreRows={async ({ startIndex, stopIndex }) => {
                      getUnLinkedDevicesCB(
                        startIndex,
                        stopIndex - startIndex + 1,
                        unlinkedDevicesSearch
                      ).then((result) => {
                        setUnlinkedDevices(
                          (prev) =>
                            ({
                              ...prev,
                              data: [...(prev?.data ?? []), ...result.data]
                            }) as Paginated<DeviceDTO>
                        );
                        setLastUnlinkedDevices(stopIndex);
                      });
                    }}
                    rowCount={unlinkedDevices.totalCount}
                  >
                    {({ onRowsRendered, registerChild }) => (
                      <List
                        ref={registerChild}
                        className="scrollable-y !overflow-x-hidden"
                        height={height}
                        width={width}
                        rowCount={unlinkedDevices.totalCount}
                        rowHeight={88}
                        rowRenderer={({ key, index, style }) => {
                          const device = unlinkedDevices?.data[index];

                          if (!device) {
                            return <Skeleton key={key} style={style} />;
                          }

                          const isSelected = devicesToLink.includes(device.ident);

                          return (
                            <div key={key} style={style} className="px-4 py-1">
                              <div
                                className={`p-4 border rounded-lg flex items-center justify-between gap-4 h-full ${
                                  isSelected ? 'border-success bg-success/10' : 'border-gray-200'
                                }`}
                              >
                                <div className="flex gap-2">
                                  <div className="flex flex-col gap-1">
                                    <CarPlate plate={device.vehiclePlate} />
                                    <div className="text-gray-600 text-xs ps-2 font-monospace">
                                      {device.ident}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className={`btn btn-sm !size-7 btn-icon ${
                                    isSelected ? 'btn-success' : 'btn-outline btn-success'
                                  }`}
                                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    toggleLinkDevice(device.ident);
                                    //  remove focus from the button to avoid showing focus styles
                                    e.currentTarget.blur();
                                  }}
                                >
                                  <KeenIcon icon={isSelected ? 'check' : 'plus'} />
                                </button>
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
            ) : (
              <div className="flex justify-center items-center h-full">
                <CircularProgress />
              </div>
            )}
          </div>
        </div>
        <div className="card pb-2.5">
          <div className="p-4 gap-4 flex flex-col items-center justify-between">
            <div className="flex items-center justify-between gap-2 w-full">
              <h3 className="card-title text-nowrap text-sm">
                <FormattedMessage id="DEVICE.GRID.LINKED_DEVICES" />
              </h3>
              <div className="flex items-center gap-2">
                {linkedDevices?.totalCount !== undefined && (
                  <h5 className="text-sm text-gray-400 text-nowrap">
                    <FormattedMessage
                      id="DEVICE.GRID.DEVICES_COUNT"
                      values={{ count: linkedDevices.totalCount }}
                    />
                  </h5>
                )}
              </div>
            </div>
            {linkedDevices && (
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <KeenIcon style="duotone" icon="magnifier" />
                </div>
                <DebouncedSearchInput
                  type="search"
                  className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-info focus:border-info"
                  placeholder={intl.formatMessage({ id: 'COMMON.SEARCH' })}
                  onDebounce={setLinkedDevicesSearch}
                />
              </div>
            )}
            {devicesToUnlink.length > 0 && (
              <span className="text-xs text-warning font-semibold text-nowrap">
                {devicesToUnlink.length} <FormattedMessage id="COMMON.SELECTED" />
              </span>
            )}
          </div>
          <div className="card-body p-0">
            {linkedDevices ? (
              <AutoSizer>
                {({ height, width }) => (
                  <InfiniteLoader
                    isRowLoaded={({ index }) => !!linkedDevices.data[index]}
                    loadMoreRows={async ({ startIndex, stopIndex }) => {
                      if (!userId) return;
                      const data = await getLinkedDevicesCB(
                        userId,
                        startIndex,
                        stopIndex,
                        linkedDevicesSearch
                      );
                      setLinkedDevices((prev) => ({
                        data: [...(prev?.data ?? []), ...data.data],
                        totalCount: data.totalCount
                      }));
                      setLastLinkedDevices(stopIndex);
                    }}
                    rowCount={linkedDevices.totalCount}
                  >
                    {({ onRowsRendered, registerChild }) => (
                      <List
                        ref={registerChild}
                        className="scrollable-y !overflow-x-hidden"
                        height={height}
                        width={width}
                        rowCount={linkedDevices.totalCount}
                        rowHeight={88}
                        rowRenderer={({ key, index, style }) => {
                          const device = linkedDevices?.data[index];

                          if (!device) {
                            return <Skeleton key={key} style={style} />;
                          }

                          const isSelected = devicesToUnlink.includes(device.ident);

                          return (
                            <div key={key} style={style} className="px-4 py-1">
                              <div
                                className={`p-4 border rounded-lg flex items-center justify-between gap-4 h-full ${
                                  isSelected ? 'border-success bg-success/10' : 'border-gray-200'
                                }`}
                              >
                                <div className="flex gap-2">
                                  <div className="flex flex-col gap-1">
                                    <CarPlate plate={device.vehiclePlate} />
                                    <div className="text-gray-600 text-xs ps-2 font-monospace">
                                      {device.ident}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className={`btn btn-sm !size-7 btn-icon ${
                                    isSelected ? 'btn-warning' : 'btn-outline btn-warning'
                                  }`}
                                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    toggleUnlinkDevice(device.ident);
                                    // remove focus from the button to avoid showing focus styles
                                    e.currentTarget.blur();
                                  }}
                                >
                                  <KeenIcon icon={isSelected ? 'check' : 'minus'} />
                                </button>
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
            ) : (
              <div className="flex justify-center items-center h-full">
                <CircularProgress />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-outline btn-danger"
            onClick={handleCancelSelection}
            disabled={isSubmitting}
          >
            <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSaveChanges}
            disabled={isSubmitting || (devicesToLink.length === 0 && devicesToUnlink.length === 0)}
          >
            {isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeviceBlock = ({ user }: AddUserPageProps) => {
  return (
    <div className="card pb-2.5">
      <div className="card-header">
        <h3 className="card-title">
          <FormattedMessage id="USER.ADD.TAB.DEVICE" />
        </h3>
      </div>
      <div className="card-body h-[550px]">
        <DeviceLinking userId={user?.id} userType="user" />
      </div>
    </div>
  );
};

export { DeviceLinking, DeviceBlock };
